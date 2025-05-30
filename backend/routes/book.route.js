import express from 'express';
import { createBook, deleteBook, getBookById, listBooks, updateBook } from '../controllers/book.controller.js';
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post('/create', authMiddleware, createBook);
router.delete("/delete/:bookId", authMiddleware, deleteBook);
router.put("/update/:bookId", authMiddleware, updateBook);
router.get("/list", authMiddleware, listBooks);
router.get("/:bookId", authMiddleware, getBookById);

export default router;