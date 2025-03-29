import express from "express";
import { register, login, getProfile, deleteUser, updateUser } from "../controllers/userController.js";
import upload from "../middlewares/upload.js"
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", upload.single("photo"), register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.delete("/:id", authMiddleware, deleteUser);
router.put("/:id", authMiddleware, upload.single("photo"), updateUser);

export default router;