import Club from "../models/club.model.js";
import User from "../models/user.model.js";
import mongoose from 'mongoose';
import Meet from '../models/meet.model.js';
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from "url";
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads/clubs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const create = async (req, res) => {
    const session = await mongoose.startSession();
    let filename = null;
    
    try {
        session.startTransaction();

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const { name, description, rules } = req.body;
        const adminId = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Selecione uma imagem para o banner'
            });
        }

        // filename = `banner-${uuidv4()}.webp`;
        filename = req.file.filename;
        const bannerUrl = `${req.protocol}://${req.get("host")}/uploads/clubs/${filename}`;
        
        // await sharp(req.file.buffer)
        //     .resize(1200, 600, { fit: 'cover' })
        //     .webp({ quality: 80 })
        //     .toFile(path.join(uploadDir, filename));

        const newClub = await Club.create([{
            name,
            banner: bannerUrl,
            admin: adminId,
            description,
            rules,
            members: [adminId]
        }], { session });

        const updatedUser = await User.findByIdAndUpdate(
            adminId,
            {
                $addToSet: {
                    memberClubs: newClub[0]._id,
                    adminClubs: newClub[0]._id
                }
            },
            { 
                new: true,
                runValidators: true,
                session
            }
        );

        if (!updatedUser) {
            throw new Error('Falha ao atualizar o usuário administrador');
        }

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            data: {
                club: newClub[0],
                user: updatedUser
            },
            message: 'Clube criado com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        
        if (filename) {
            const filePath = path.join(uploadDir, filename);
            if (fs.existsSync(filePath)) {
                try {
                    await fs.promises.unlink(filePath); // Corrigido para usar promises
                } catch (unlinkError) {
                    console.error('Erro ao excluir o arquivo de imagem temporário:', unlinkError);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao excluir o arquivo de imagem temporário'
                    });
                }
            }
        }
    
        console.error('Erro na criação do clube:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const deleteClub = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        
        const { id } = req.params;
        const userId = req.user._id;

        const club = await Club.findById(id).session(session);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Clube não encontrado'
            });
        }

        if (club.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o administrador pode excluir o clube'
            });
        }

        const bannerUrl = club.banner;
        
        await Club.deleteOne({ _id: id }).session(session);

        await User.updateMany(
            { $or: [{ memberClubs: id }, { adminClubs: id }] },
            { $pull: { memberClubs: id, adminClubs: id } },
            { session }
        );

        await session.commitTransaction();

        if (bannerUrl) {
            const filename = bannerUrl.split('/').pop();
            const filePath = path.join(uploadDir, filename);
            
            if (fs.existsSync(filePath)) {
                try {
                    await fs.promises.unlink(filePath);
                } catch (unlinkError) {
                    console.error('Erro ao excluir banner:', unlinkError);
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Clube excluído com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro na exclusão do clube:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const updateClub = async (req, res) => {
    const session = await mongoose.startSession();
    let newFilename = null;
    let oldBannerUrl = null;
    
    try {
        session.startTransaction();

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const { id } = req.params;
        const { name, description, rules } = req.body;
        const userId = req.user._id;

        const club = await Club.findById(id).session(session);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Clube não encontrado'
            });
        }

        if (club.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o administrador pode atualizar o clube'
            });
        }

        oldBannerUrl = club.banner;

        if (req.file) {
            newFilename = req.file.filename;
            const bannerUrl = `${req.protocol}://${req.get("host")}/uploads/clubs/${newFilename}`;
            club.banner = bannerUrl;
        }

        if (name) club.name = name;
        if (description) club.description = description;
        if (rules) club.rules = rules;

        await club.save({ session });

        await session.commitTransaction();

        if (oldBannerUrl && req.file) {
            const oldFilename = oldBannerUrl.split('/').pop();
            const oldFilePath = path.join(uploadDir, oldFilename);
            
            if (fs.existsSync(oldFilePath)) {
                try {
                    await fs.promises.unlink(oldFilePath);
                } catch (unlinkError) {
                    console.error('Erro ao excluir banner antigo:', unlinkError);
                }
            }
        }

        return res.status(200).json({
            success: true,
            data: club,
            message: 'Clube atualizado com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        
        if (newFilename) {
            const newFilePath = path.join(uploadDir, newFilename);
            if (fs.existsSync(newFilePath)) {
                try {
                    await fs.promises.unlink(newFilePath);
                } catch (unlinkError) {
                    console.error('Erro ao excluir novo banner:', unlinkError);
                }
            }
        }

        console.error('Erro na atualização do clube:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const listClubs = async (req, res) => {
    try {
        const { page = 1, limit = 9, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const userId = req.user?._id;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const options = {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
            sort,
            populate: {
                path: 'admin',
                select: 'username avatar'
            }
        };

        const [clubs, total] = await Promise.all([
            Club.find(filter)
                .select('name banner description membersCount rules createdAt')
                .lean()
                .populate(options.populate)
                .skip(options.skip)
                .limit(options.limit)
                .sort(options.sort),
            Club.countDocuments(filter)
        ]);

        if (userId) {
            const userClubs = await Club.find({
                members: userId,
                _id: { $in: clubs.map(c => c._id) }
            }).distinct('_id');

            clubs.forEach(club => {
                club.isMember = userClubs.some(c => c.equals(club._id));
            });
        }

        const formattedClubs = clubs.map(club => ({
            ...club,
            banner: club.banner || 'https://example.com/default-banner.jpg',
            membersCount: club.members?.length || 0,
            admin: club.admin || { username: 'Admin removido' }
        }));

        return res.status(200).json({
            success: true,
            data: {
                clubs: formattedClubs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / options.limit),
                    totalClubs: total
                }
            },
            message: 'Clubes listados com sucesso'
        });

    } catch (error) {
        console.error('Erro ao listar clubes:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};

export const listClubMeets = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 9, 
            sortBy = 'datetime', 
            sortOrder = 'asc',
            status
        } = req.query;

        const { clubId } = req.params; // ID do clube vindo da URL

        // Filtro fixo para o clube específico
        const filter = { clubId }; 

        // Filtros opcionais adicionais
        if (status) filter.status = status;
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Ordenação
        const sort = {};
        const validSortFields = ['datetime', 'createdAt', 'title'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'datetime';
        sort[sortField] = sortOrder === 'desc' ? -1 : 1;

        // Opções de consulta
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

        // Consulta otimizada para um clube específico
        const [meets, total] = await Promise.all([
            Meet.find(filter)
                .select('-discussions -pinnedMessages')
                .populate(options.populate)
                .skip(options.skip)
                .limit(options.limit)
                .sort(options.sort)
                .lean(),
            Meet.countDocuments(filter)
        ]);

        // Formatação dos resultados
        const formattedMeets = meets.map(meet => ({
            ...meet,
            datetime: meet.datetime.toISOString(),
            club: meet.clubId.name,
            book: meet.book || { title: 'Livro removido' },
            organizer: meet.createdBy
        }));

        // Resposta adaptada
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
            message: 'Reuniões do clube listadas com sucesso'
        });

    } catch (error) {
        console.error('Erro ao listar reuniões do clube:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};

export const addMember = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { clubId } = req.params;
        const { memberId } = req.body;
        const adminId = req.user._id;

        // Validação do ID do membro
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: 'ID do membro inválido'
            });
        }

        // Busca o clube com verificação de admin
        const club = await Club.findOne({
            _id: clubId,
            admin: adminId
        }).session(session);

        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Clube não encontrado ou usuário não é administrador'
            });
        }

        // Verifica se o membro já existe no clube
        if (club.members.includes(memberId)) {
            return res.status(409).json({
                success: false,
                message: 'Usuário já é membro deste clube'
            });
        }

        // Verifica se o usuário a ser adicionado existe
        const userToAdd = await User.findById(memberId).session(session);
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'Usuário a ser adicionado não encontrado'
            });
        }

        // Atualiza o clube
        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            {
                $addToSet: { members: memberId },
                $inc: { membersCount: 1 }
            },
            { 
                new: true,
                runValidators: true,
                session 
            }
        ).populate('members', 'username email avatar');

        // Atualiza o usuário adicionado
        await User.findByIdAndUpdate(
            memberId,
            { $addToSet: { memberClubs: clubId } },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            data: {
                club: updatedClub,
                newMember: {
                    _id: userToAdd._id,
                    username: userToAdd.username,
                    avatar: userToAdd.avatar
                }
            },
            message: 'Membro adicionado com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao adicionar membro:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const removeMember = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { clubId } = req.params;
        const { memberId } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: 'ID do membro inválido'
            });
        }

        const club = await Club.findById(clubId)
            .populate('admin', '_id')
            .session(session);

        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Clube não encontrado'
            });
        }

        const isAdmin = club.admin._id.equals(userId);
        const isSelf = memberId === userId.toString();

        if (!isAdmin && !isSelf) {
            return res.status(403).json({
                success: false,
                message: 'Apenas o administrador ou o próprio membro podem remover'
            });
        }

        if (isAdmin && isSelf) {
            return res.status(403).json({
                success: false,
                message: 'O administrador não pode se remover do clube'
            });
        }

        if (!club.members.includes(memberId)) {
            return res.status(404).json({
                success: false,
                message: 'Membro não encontrado neste clube'
            });
        }

        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            {
                $pull: { members: memberId },
                $inc: { membersCount: -1 }
            },
            {
                new: true,
                runValidators: true,
                session
            }
        ).populate('members', 'username profilePhoto');

        await User.findByIdAndUpdate(
            memberId,
            { $pull: { memberClubs: clubId } },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            data: {
                club: updatedClub,
                removedMemberId: memberId
            },
            message: 'Membro removido com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao remover membro:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};