import Meet from '../models/meet.model.js';
import Club from '../models/club.model.js';
import Book from '../models/book.model.js';
import mongoose from 'mongoose';

export const createMeet = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Verificação de autenticação
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const { clubId, bookId, title, description, datetime, location } = req.body;
        const adminId = req.user._id;

        // Validação dos campos obrigatórios
        const requiredFields = ['clubId', 'bookId', 'title', 'description', 'datetime'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
            });
        }

        // Verifica se o clube existe e o usuário é admin
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

        // Verifica se o livro existe
        const bookExists = await Book.findById(bookId).session(session);
        if (!bookExists) {
            return res.status(404).json({
                success: false,
                message: 'Livro não encontrado'
            });
        }

        // Validação da data
        const meetDate = new Date(datetime);
        if (isNaN(meetDate.getTime()) || meetDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Data inválida ou deve ser futura'
            });
        }

        // Criação do meet
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

        // Validação do schema antes de salvar
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

        // Atualiza o clube com o novo meet
        await Club.findByIdAndUpdate(
            clubId,
            { $push: { meets: newMeet._id } },
            { session }
        );

        await session.commitTransaction();

        // Popula os dados para a resposta
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

        // Tratamento específico para erros de banco de dados
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