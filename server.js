const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // لكي يستطيع السيرفر استقبال صور كبيرة

const DB_FILE = '/tmp/database.json'; // Vercel يسمح بالكتابة فقط في مجلد tmp

// تهيئة قاعدة البيانات إذا لم تكن موجودة
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ uploads: [] }));
}

app.get('/', (req, res) => {
    res.send("السيرفر يعمل بنجاح على Vercel!");
});

// مسار رفع البيانات (بدون مكتبات معقدة لتجنب الـ 500 Error)
app.post('/upload', (req, res) => {
    try {
        const { fileData, fileName, apiKey } = req.body;

        if (apiKey !== "my_secret_password_123") {
            return res.status(403).json({ error: "خطأ في مفتاح الأمان" });
        }

        const db = JSON.parse(fs.readFileSync(DB_FILE));
        const newEntry = {
            id: Date.now(),
            name: fileName,
            data: fileData, // هنا سيتم حفظ الملف كـ Base64
            date: new Date()
        };

        db.uploads.push(newEntry);
        fs.writeFileSync(DB_FILE, JSON.stringify(db));

        res.json({ success: true, message: "تم الحفظ بنجاح داخل JSON" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app; // مهم جداً لـ Vercel
