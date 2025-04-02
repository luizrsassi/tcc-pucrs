import express from "express";
import { createMeet } from "../controllers/meet.controller.js";
import upload from "../middlewares/upload.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeet);

export default router;