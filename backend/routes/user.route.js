import express from "express";
import { register, login, getProfile, deleteUser, updateUser, logout } from "../controllers/user.controller.js";
import upload from "../middlewares/upload.js"
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", upload.single("photo"), register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile);
router.delete("/:id", authMiddleware, deleteUser);
router.put("/:id", authMiddleware, upload.single("photo"), updateUser);

export default router;