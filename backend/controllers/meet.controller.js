import Meet from '../models/meet.model.js';
import Club from '../models/club.model.js';
import Book from '../models/book.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

const MAX_PINNED_MESSAGES = 3;

export const createMeet = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const { clubId, bookId, title, description, datetime, location } = req.body;
        const adminId = req.user._id;

        const requiredFields = ['clubId', 'bookId', 'title', 'description', 'datetime'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
            });
        }

        const club = await Club.findById(clubId).session(session);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Clube não encontrado'
            });
        }

        if (club.admin.toString() !== adminId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o administrador do clube pode criar encontros'
            });
        }

        const bookExists = await Book.findById(bookId).session(session);
        if (!bookExists) {
            return res.status(404).json({
                success: false,
                message: 'Livro não encontrado'
            });
        }

        const meetDate = new Date(datetime);
        if (isNaN(meetDate.getTime()) || meetDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Data inválida ou deve ser futura'
            });
        }

        const newMeet = new Meet({
            clubId,
            book: bookId,
            title,
            description,
            datetime: meetDate,
            location: location || 'Online',
            createdBy: adminId,
            readingProgress: {
                currentPage: 1,
                totalPages: bookExists.pages || 1
            }
        });

        const validationError = newMeet.validateSync();
        if (validationError) {
            const errors = Object.values(validationError.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors
            });
        }

        await newMeet.save({ session });

        await Club.findByIdAndUpdate(
            clubId,
            { $push: { meets: newMeet._id } },
            { session }
        );

        await session.commitTransaction();

        const populatedMeet = await Meet.findById(newMeet._id)
            .populate('book', 'title author cover')
            .populate('createdBy', 'username profilePhoto');

        return res.status(201).json({
            success: true,
            data: populatedMeet,
            message: 'Encontro criado com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao criar encontro:', error);

        if (error.name === 'MongoServerError') {
            return res.status(500).json({
                success: false,
                message: 'Erro no servidor de banco de dados'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const updateMeet = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { meetId } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'admin'
            })
            .session(session);

        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Reunião não encontrada'
            });
        }

        if (meet.clubId.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o administrador pode editar a reunião'
            });
        }

        const allowedUpdates = {
            title: { type: 'string', max: 100 },
            description: { type: 'string', max: 1000 },
            datetime: { type: 'date' },
            location: { type: 'string', max: 200 },
            book: { type: 'objectId', ref: 'Book' }
        };

        const updateObject = {};
        for (const [key, value] of Object.entries(updates)) {
            if (!allowedUpdates[key]) continue;

            if (key === 'datetime') {
                const newDate = new Date(value);
                if (isNaN(newDate) || newDate <= new Date()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data inválida ou deve ser futura'
                    });
                }
                updateObject[key] = newDate;
            }
            else if (key === 'book') {
                const bookExists = await Book.exists({ _id: value }).session(session);
                if (!bookExists) {
                    return res.status(404).json({
                        success: false,
                        message: 'Livro não encontrado'
                    });
                }
                updateObject[key] = value;
            }
            else {
                if (typeof value !== allowedUpdates[key].type) continue;
                if (allowedUpdates[key].max && value.length > allowedUpdates[key].max) continue;
                updateObject[key] = value;
            }
        }

        const updatedMeet = await Meet.findByIdAndUpdate(
            meetId,
            { $set: updateObject },
            { 
                new: true,
                runValidators: true,
                session
            }
        )
        .populate('book', 'title author')
        .populate('createdBy', 'name photo');

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            data: updatedMeet,
            message: 'Reunião atualizada com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao atualizar reunião:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const deleteMeet = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { meetId } = req.params;
        const userId = req.user._id;

        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'admin meets'
            })
            .session(session);

        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Reunião não encontrada'
            });
        }

        if (meet.clubId.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o administrador pode excluir reuniões'
            });
        }

        await Meet.deleteOne({ _id: meetId }).session(session);

        await Club.findByIdAndUpdate(
            meet.clubId._id,
            { $pull: { meets: meetId } },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            data: {
                deletedMeetId: meetId,
                remainingMeets: meet.clubId.meets.length - 1
            },
            message: 'Reunião excluída com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao excluir reunião:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID da reunião inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const getMeetById = async (req, res) => {
    try {
        const { id } = req.params;

        const meet = await Meet.findById(id)
            .select('-discussions -pinnedMessages')
            .populate([
                { path: 'book', select: 'title author cover' },
                { path: 'createdBy', select: 'name photo' },
                { path: 'clubId', select: 'name' }
            ])
            .lean();

        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Encontro não encontrado'
            });
        }

        // Formatar dados
        const formattedMeet = {
            ...meet,
            datetime: meet.datetime.toISOString(),
            club: meet.clubId.name,
            book: meet.book || { title: 'Livro removido' },
            organizer: meet.createdBy
        };

        return res.status(200).json({
            success: true,
            data: formattedMeet,
            message: 'Detalhes do encontro obtidos com sucesso'
        });

    } catch (error) {
        console.error('Erro ao buscar encontro:', error);
        return res.status(500).json({
            success: false,
            message: error.name === 'CastError' 
                ? 'ID do encontro inválido' 
                : 'Erro interno no servidor'
        });
    }
};

export const listMeets = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 9, 
            search, 
            sortBy = 'datetime', 
            sortOrder = 'asc',
            clubId,
            bookId,
            status
        } = req.query;

        const filter = {};
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (clubId) filter.clubId = clubId;
        if (bookId) filter.book = bookId;
        if (status) filter.status = status;

        const sort = {};
        const validSortFields = ['datetime', 'createdAt', 'title'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'datetime';
        sort[sortField] = sortOrder === 'desc' ? -1 : 1;

        const options = {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
            sort,
            populate: [
                { path: 'book', select: 'title author cover' },
                { path: 'createdBy', select: 'username profilePhoto' },
                { path: 'clubId', select: 'name' }
            ]
        };

        const [meets, total] = await Promise.all([
            Meet.find(filter)
                .select('-discussions -pinnedMessages')
                .lean()
                .populate(options.populate)
                .skip(options.skip)
                .limit(options.limit)
                .sort(options.sort),
            
            Meet.countDocuments(filter)
        ]);

        const formattedMeets = meets.map(meet => ({
            ...meet,
            datetime: meet.datetime.toISOString(),
            club: meet.clubId.name,
            book: meet.book || { title: 'Livro removido' },
            organizer: meet.createdBy
        }));

        return res.status(200).json({
            success: true,
            data: {
                meets: formattedMeets,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / options.limit),
                    totalMeets: total,
                    resultsPerPage: options.limit
                }
            },
            message: 'Reuniões listadas com sucesso'
        });

    } catch (error) {
        console.error('Erro ao listar reuniões:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};

export const addMessageToMeet = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { meetId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'O texto da mensagem é obrigatório'
            });
        }

        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'members'
            })
            .session(session);

        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Encontro não encontrado'
            });
        }

        const isMember = meet.clubId.members.some(member => 
            member._id.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'Apenas membros do clube podem enviar mensagens'
            });
        }
        const newMessage = {
            user: userId,
            text: text.trim(),
            timestamp: new Date()
        };

        meet.discussions.push(newMessage);
        // await meet.save({ session });
        await meet.save({ session, validateModifiedOnly: true });

        await session.commitTransaction();

        let userDetails;
        try {
            userDetails = await User.findById(userId, 'name photo');
        } catch (error) {
            console.error('Erro ao buscar detalhes do usuário:', userError);
            userDetails = { username: 'Usuário desconhecido' };
        }

        const responseMessage = {
            ...newMessage,
            _id: meet.discussions[meet.discussions.length - 1]._id,
            user: userDetails
        };

        return res.status(201).json({
            success: true,
            data: responseMessage,
            message: 'Mensagem adicionada com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao adicionar mensagem:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID do encontro inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const deleteMessage = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { meetId, messageId } = req.params;
        const userId = req.user._id;

        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'admin members'
            })
            .session(session);

        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Encontro não encontrado'
            });
        }

        const messageIndex = meet.discussions.findIndex(msg => 
            msg._id.toString() === messageId
        );

        if (messageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        const message = meet.discussions[messageIndex];
        const isAdmin = meet.clubId.admin.toString() === userId.toString();
        const isAuthor = message.user.toString() === userId.toString();

        if (!isAdmin && !isAuthor) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o autor ou administrador pode excluir mensagens'
            });
        }

        meet.discussions.splice(messageIndex, 1);
        
        meet.pinnedMessages = meet.pinnedMessages.filter(
            pinnedId => pinnedId.toString() !== messageId
        );

        await meet.save({ session, validateModifiedOnly: true });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            data: {
                deletedMessageId: messageId,
                remainingMessages: meet.discussions.length
            },
            message: 'Mensagem excluída com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao excluir mensagem:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const pinMessage = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { meetId, messageId } = req.params;
        const userId = req.user._id;

        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'admin'
            })
            .session(session);

        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Encontro não encontrado'
            });
        }

        if (meet.clubId.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Apenas administradores podem fixar mensagens'
            });
        }

        const messageExists = meet.discussions.some(msg => 
            msg._id.toString() === messageId
        );

        if (!messageExists) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada neste encontro'
            });
        }

        if (meet.pinnedMessages.length >= MAX_PINNED_MESSAGES) {
            return res.status(400).json({
                success: false,
                message: `Limite máximo de ${MAX_PINNED_MESSAGES} mensagens fixadas atingido`
            });
        }

        if (!meet.pinnedMessages.includes(messageId)) {
            meet.pinnedMessages.push(messageId);
            await meet.save({ session });
        }

        await session.commitTransaction();

        const pinnedMessage = meet.discussions.find(msg => 
            msg._id.toString() === messageId
        );

        const userDetails = await User.findById(
            pinnedMessage.user,
            'username profilePhoto'
        );

        return res.status(200).json({
            success: true,
            data: {
                ...pinnedMessage.toObject(),
                user: userDetails
            },
            message: 'Mensagem fixada com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao fixar mensagem:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const unpinMessage = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { meetId, messageId } = req.params;
        const userId = req.user._id;

        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'admin'
            })
            .session(session);

        if (!meet) {
            return res.status(404).json({ /* ... */ });
        }

        if (meet.clubId.admin.toString() !== userId.toString()) {
            return res.status(403).json({ /* ... */ });
        }

        meet.pinnedMessages = meet.pinnedMessages.filter(id => 
            id.toString() !== messageId
        );

        await meet.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: 'Mensagem desafixada com sucesso'
        });

    } catch (error) {
    } finally {
        session.endSession();
    }
};

export const listMeetMessages = async (req, res) => {
    try {
        const { meetId } = req.params;
        const userId = req.user._id;

        // Verificação de acesso e obtenção do encontro
        const meet = await Meet.findById(meetId)
            .populate({
                path: 'clubId',
                select: 'members'
            })
            .populate({
                path: 'discussions.user',
                select: 'name photo'
            })
            .lean();

        // Verificações de existência e permissão
        if (!meet) {
            return res.status(404).json({
                success: false,
                message: 'Encontro não encontrado'
            });
        }
        
        const isMember = meet.clubId.members.some(member => 
            member._id.toString() === userId.toString()
        );
        
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'Apenas membros do clube podem ver as mensagens'
            });
        }

        // Formatação das mensagens com status de fixação
        const formattedMessages = meet.discussions.map(msg => ({
            _id: msg._id,
            text: msg.text,
            timestamp: msg.timestamp,
            user: msg.user,
            isPinned: meet.pinnedMessages.some(
                pinnedId => pinnedId.toString() === msg._id.toString()
            )
        })).sort((a, b) => b.timestamp - a.timestamp); // Ordena por data decrescente

        return res.status(200).json({
            success: true,
            data: {
                messages: formattedMessages,
                pinnedCount: meet.pinnedMessages.length
            },
            message: 'Mensagens obtidas com sucesso'
        });

    } catch (error) {
        console.error('Erro ao listar mensagens:', error);
        return res.status(500).json({
            success: false,
            message: error.name === 'CastError' 
                ? 'ID do encontro inválido' 
                : 'Erro interno no servidor'
        });
    }
};