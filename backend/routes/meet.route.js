import express from "express";
import { addMessageToMeet, createMeet, deleteMeet, deleteMessage, getMeetById, listMeetMessages, listMeets, pinMessage, unpinMessage, updateMeet } from "../controllers/meet.controller.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeet);
router.get("/list", authMiddleware, listMeets);
router.get("/:id", authMiddleware, getMeetById);
router.put("/:meetId", authMiddleware, updateMeet);
router.delete("/delete/:meetId", authMiddleware, deleteMeet);
router.post("/:meetId/post", authMiddleware, addMessageToMeet);
router.delete("/:meetId/post/:messageId", authMiddleware, deleteMessage);
router.put("/:meetId/pinned-post/:messageId", authMiddleware, pinMessage);
router.delete("/:meetId/pinned-post/:messageId", authMiddleware, unpinMessage);
router.get("/:meetId/messages", authMiddleware, listMeetMessages);

export default router;