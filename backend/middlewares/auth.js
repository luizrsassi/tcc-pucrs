import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ error: "Acesso negado. Token ausente." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(401).json({ error: "Usuário não encontrado." });
        }

        req.user = user; // Injeta o usuário autenticado no request
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido ou expirado." });
    }
};

export default authMiddleware;