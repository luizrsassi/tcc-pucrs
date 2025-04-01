import multer from "multer";
import path from "path";
import fs from "fs";

// const uploadsDir = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

const createUploadDirs = () => {
    const baseDir = path.join(process.cwd(), "uploads");
    const directories = [
        path.join(baseDir, "users"),
        path.join(baseDir, "clubs")
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destFolder = "generic";

        if (req.originalUrl.includes("/users")) {
            destFolder = "users";
        } else if (req.originalUrl.includes("/clubs")) {
            destFolder = "clubs";
        }
    
        const fullPath = path.join(process.cwd(), "uploads", destFolder);

        cb(null, fullPath)
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        cb(null, `${timestamp}-${random}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Apenas imagens são permitidas!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;