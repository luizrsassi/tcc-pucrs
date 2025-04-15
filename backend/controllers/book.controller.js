import mongoose from 'mongoose';
import Book from '../models/book.model.js';
import User from '../models/user.model.js';

export const createBook = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticação necessária'
            });
        }

        const { title, author } = req.body;
        const errors = [];
        
        if (!title?.trim()) errors.push('Título é obrigatório');
        if (!author?.trim()) errors.push('Autor é obrigatório');
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors
            });
        }

        const newBook = new Book({
            title: title.trim(),
            author: author.trim(),
            createdBy: req.user._id
        });

        const savedBook = await newBook.save();
        
        const response = await Book.findById(savedBook._id)
            .populate('createdBy', 'name email')
            .select('-__v');

        res.status(201).json({
            success: true,
            data: response,
            message: 'Livro cadastrado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao criar livro:', error);
        
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Este livro já está cadastrado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erro no servidor'
        });
    }
};

export const deleteBook = async (req, res) => {
  const session = await mongoose.startSession();
  try {
      session.startTransaction();

      const { bookId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(bookId)) {
          return res.status(400).json({
              success: false,
              message: 'ID do livro inválido'
          });
      }

      const book = await Book.findById(bookId)
          .select('createdBy title')
          .populate('createdBy', '_id')
          .session(session);

      if (!book) {
          return res.status(404).json({
              success: false,
              message: 'Livro não encontrado'
          });
      }

      const isOwner = book.createdBy?._id.toString() === userId.toString();

      let isAdmin = false;
      if (!isOwner) {
          const user = await User.findById(userId).session(session);
          isAdmin = user?.role === 'admin';
      }

      if (!isOwner && !isAdmin) {
          return res.status(403).json({
              success: false,
              message: 'Acesso não autorizado'
          });
      }

      await Book.findByIdAndDelete(bookId).session(session);
      
      await session.commitTransaction();

      res.status(200).json({
          success: true,
          message: 'Livro deletado com sucesso',
          data: {
              deletedId: bookId,
              title: book.title
          }
      });

  } catch (error) {
      await session.abortTransaction();
      console.error('Erro ao deletar livro:', error);

      res.status(500).json({
          success: false,
          message: error.message || 'Erro interno no servidor'
      });
  } finally {
      session.endSession();
  }
};

export const updateBook = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { bookId } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                success: false,
                message: 'ID do livro inválido'
            });
        }

        const book = await Book.findById(bookId)
            .populate('createdBy', '_id')
            .session(session);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Livro não encontrado'
            });
        }

        const isOwner = book.createdBy._id.toString() === userId.toString();
        let isAdmin = false;

        if (!isOwner) {
            const user = await User.findById(userId).session(session);
            isAdmin = user?.role === 'admin';
        }

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso não autorizado'
            });
        }

        const allowedUpdates = ['title', 'author'];
        const validUpdates = Object.keys(updates).filter(key => 
            allowedUpdates.includes(key) && updates[key]?.trim()
        );

        if (validUpdates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo válido para atualização'
            });
        }

        validUpdates.forEach(key => {
            book[key] = updates[key].trim();
        });

        const updatedBook = await book.save({ session });
        
        await session.commitTransaction();

        const response = await Book.findById(updatedBook._id)
            .populate('createdBy', 'username email')
            .select('-__v');

        res.status(200).json({
            success: true,
            data: response,
            message: 'Livro atualizado com sucesso'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Erro ao atualizar livro:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor'
        });
    } finally {
        session.endSession();
    }
};

export const listBooks = async (req, res) => {
  try {
      const { 
          page = 1, 
          limit = 9, 
          search, 
          sortBy = 'createdAt', 
          sortOrder = 'desc',
          author,
          userId 
      } = req.query;

      const filter = {};
      
      if (search) {
          filter.$or = [
              { title: { $regex: search, $options: 'i' } },
              { author: { $regex: search, $options: 'i' } }
          ];
      }
      
      if (author) filter.author = { $regex: author, $options: 'i' };
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          filter.createdBy = userId;
      }

      const validSortFields = ['title', 'author', 'createdAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortField]: sortDirection };

      const pageNumber = Math.max(1, parseInt(page));
      const limitNumber = Math.min(50, parseInt(limit));
      const skip = (pageNumber - 1) * limitNumber;

      const [books, total] = await Promise.all([
          Book.find(filter)
              .populate('createdBy', 'name email -_id')
              .select('title author createdAt updatedAt createdBy')
              .sort(sort)
              .skip(skip)
              .limit(limitNumber)
              .lean(),
          
          Book.countDocuments(filter)
      ]);

      const safeBooks = books.map(book => {
          const fallbackDate = new Date().toISOString();
          
          return {
              id: book._id,
              title: book.title,
              author: book.author,
              createdAt: book.createdAt?.toISOString?.() || fallbackDate,
              updatedAt: book.updatedAt?.toISOString?.() || null,
              createdBy: book.createdBy || {
                  username: 'Usuário não disponível',
                  email: 'não informado'
              }
          };
      });

      const totalPages = Math.ceil(total / limitNumber);
      
      res.status(200).json({
          success: true,
          data: {
              books: safeBooks,
              pagination: {
                  currentPage: pageNumber,
                  totalPages,
                  totalBooks: total,
                  resultsPerPage: safeBooks.length,
                  hasNextPage: pageNumber < totalPages
              }
          }
      });

  } catch (error) {
      console.error('Erro ao listar livros:', error);
      
      const errorMessage = error.name === 'CastError' 
          ? 'Parâmetros de busca inválidos' 
          : 'Erro interno no servidor';

      res.status(500).json({
          success: false,
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
  }
};