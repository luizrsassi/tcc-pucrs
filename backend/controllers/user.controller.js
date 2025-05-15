    import User from "../models/user.model.js";
    import BlacklistedToken from '../models/blacklistedToken.model.js';
    import jwt from "jsonwebtoken";
    import fs from "fs";
    import path from "path";
    import { fileURLToPath } from 'url';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const UPLOADS_PATH = path.join(__dirname, '../../uploads/users');

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userData = { 
        name, 
        email, 
        password,
        photo: req.file ? req.file.filename : null
        };

        const user = await User.create(userData);

        const photoUrl = user.photo 
        ? `${req.protocol}://${req.get("host")}/uploads/users/${user.photo}`
        : null;
        res.status(201).json({ ...user.toObject(), photo: photoUrl });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
        throw new Error("Credenciais inválidas");
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
        });

        user.password = undefined;
        res.json({ user, token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                await BlacklistedToken.create({
                    token,
                    expiresAt: new Date(decoded.exp * 1000)
                });
            } catch (decodeError) {
                // Token inválido não precisa ser processado
            }
        }

        res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro durante o logout'
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUser = req.user;

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        if (currentUser._id.toString() !== userId && !currentUser.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acesso não autorizado: Você só pode deletar sua própria conta' 
            });
        }

        if (userToDelete.photo) {
            const photoPath = path.join(UPLOADS_PATH, userToDelete.photo);
            fs.unlink(photoPath, (error) => {
                if (error) {
                console.error(`Erro ao deletar imagem: ${error.message}`);
                } else {
                console.log(`Imagem ${userToDelete.photo} deletada com sucesso`);
                }
            });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        const response = {
        id: user._id,
        name: user.name,
        isAdmin: user.isAdmin,
        email: user.email,
        photo: user.photo,
        memberClubs: user.memberClubs,
        adminClubs: user.adminClubs
        };

        res.status(200).json({
        success: true,
        data: response
        });

    } catch (error) {
        console.error('Erro no perfil:', error);
        res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil'
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        const currentUser = req.user;

        if (currentUser._id.toString() !== userId && !currentUser.isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: 'Não autorizado: você só pode atualizar seu próprio perfil' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado' 
            });
        }

        // Verificação e atualização de senha
        if (updates.newPassword) {
            if (!updates.currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha atual é obrigatória para alteração'
                });
            }

            const isMatch = await bcrypt.compare(updates.currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Senha atual incorreta'
                });
            }

            user.password = updates.newPassword;
        }

        // Atualização de foto
        if (req.file) {
            if (user.photo) {
                const oldPhotoPath = path.join(__dirname, '../../uploads/users/', user.photo);
                fs.unlink(oldPhotoPath, (error) => {
                    if (error) console.error(`Erro ao deletar imagem: ${error.message}`);
                });
            }
            user.photo = req.file.filename;
        }

        // Atualização de campos básicos
        const allowedUpdates = ['name', 'email'];
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                user[key] = updates[key];
            }
        });

        const updatedUser = await user.save();

        const responseUser = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: `${process.env.BASE_URL}/uploads/users/${updatedUser.photo}`,
            isAdmin: updatedUser.isAdmin,
            memberClubs: updatedUser.memberClubs,
            adminClubs: updatedUser.adminClubs
        };

        res.status(200).json({ success: true, data: responseUser });

    } catch (error) {
        console.error('Erro na atualização:', error);
        
        let message = 'Erro ao atualizar usuário';
        if (error.code === 11000) message = 'Este email já está em uso';
        
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.message || message 
        });
    }
};