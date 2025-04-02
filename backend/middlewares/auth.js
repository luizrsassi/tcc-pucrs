import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import BlacklistedTokenModel from "../models/blacklistedToken.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
    
        if (!authHeader?.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Formato de token inválido'
          });
        }
    
        const token = authHeader.split(' ')[1];

        const blacklisted = await BlacklistedTokenModel.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Sessão expirada'
              });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
            .select("-password -__v")
            .lean();
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Usuário não encontrado." 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error.message);

        const errorMessages = {
            'jwt expired': 'Token expirado',
            'invalid signature': 'Assinatura inválida',
            'jwt malformed': 'Token malformado'
        };

        return res.status(401).json({
            success: false,
            message: errorMessages[error.message] || 'Falha na autenticação'
          });
    }
};

export default authMiddleware;