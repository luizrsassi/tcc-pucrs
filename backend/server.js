import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/user.route.js";
import clubRoutes from "./routes/club.route.js";
import meetingRoutes from "./routes/meet.route.js";
import bookRoutes from "./routes/book.route.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Range'],
    exposedHeaders: ['Content-Range']
}));

const staticOptions = {
    index: false,
    extensions: ['webp', 'jpg', 'png', 'jpeg'],
    setHeaders: (res, filePath) => {
        res.set("Cache-Control", "public, max-age=31536000");
        if (filePath.endsWith(".webp")) res.type("image/webp");
    }
};

app.use("/uploads/clubs", express.static(
    path.join(__dirname, "..", "uploads", "clubs"),
    staticOptions
));

app.use("/uploads/users", express.static(
    path.join(__dirname, "..", "uploads", "users"),
    staticOptions
));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/meet", meetingRoutes);
app.use("/api/books", bookRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    // console.log(`Server started at http://localhost:${PORT}`);
});