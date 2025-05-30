import express from "express";
import { addMember, create, deleteClub, getClub, listClubMeets, listClubs, removeMember, updateClub } from "../controllers/club.controller.js";
import upload from "../middlewares/upload.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, upload.single("banner"), create);
router.delete("/delete/:id", authMiddleware, deleteClub);
router.put("/update/:id", authMiddleware, upload.single("banner"), updateClub);
router.get("/", authMiddleware, listClubs);
router.get("/:clubId/meets", authMiddleware, listClubMeets);
router.get("/:id", authMiddleware, getClub);
router.patch("/:clubId/members", authMiddleware, addMember);
router.delete("/:clubId/members", authMiddleware, removeMember);

export default router;