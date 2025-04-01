import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/user.route.js";
import clubRoutes from "./routes/club.route.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is ready123");
});

app.use("/api/users", userRoutes);
app.use("/api/clubs", clubRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});