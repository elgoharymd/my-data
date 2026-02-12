const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs-extra');
const { nanoid } = require('nanoid');

const app = express();

// إعدادات احترافية
app.use(cors()); // السماح بالوصول من أي مكان
app.use(express.json()); // فهم بيانات JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // جعل مجلد الملفات عاماً

// التأكد من وجود مجلد الرفع وقاعدة البيانات
const UPLOADS_DIR = './uploads';
const DB_FILE = './database.json';
fs.ensureDirSync(UPLOADS_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeJsonSync(DB_FILE, { items: [], uploads: [] });

// --- إعدادات رفع الملفات ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${nanoid(10)}${ext}`);
    }
});
const upload = multer({ storage });

// --- المسارات (Routes) ---

// 1. رفع ملف وحفظ الرابط في قاعدة البيانات
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "يرجى اختيار ملف" });

        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        // تحديث قاعدة بيانات JSON بالرابط الجديد
        const db = await fs.readJson(DB_FILE);
        const newEntry = { id: nanoid(5), url: fileUrl, timestamp: new Date() };
        db.uploads.push(newEntry);
        await fs.writeJson(DB_FILE, db);

        res.status(200).json({ success: true, url: fileUrl, data: newEntry });
    } catch (error) {
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

// 2. الحصول على كافة البيانات من JSON
app.get('/data', async (req, res) => {
    const db = await fs.readJson(DB_FILE);
    res.json(db);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Professional Server is running on port ${PORT}`);
});
