const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

// إعدادات البيئة
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. --- إعدادات Cloudinary ---
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: 'P-eHCflFjiVa5EkJP_9FlXy6DTM', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM' 
});

// 2. --- إعدادات Upstash Redis (لجعل الروابط دائمة) ---
const REDIS_URL = "https://measured-boxer-55160.upstash.io";
const REDIS_TOKEN = "Add4AAIncDI4MzI2NWQ0MzE4OGM0YzExYWI4ODdlZDQ5OGJkMzcwN3AyNTUxNjA";

// --- الدوال المساعدة ---

// دالة توليد معرف فريد للقاعدة
function generateID() {
    return Math.random().toString(36).substring(2, 8);
}

// دالة حفظ الرابط في Redis
async function saveToDB(id, longUrl) {
    await fetch(`${REDIS_URL}/set/${id}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        body: JSON.stringify(longUrl),
        method: 'POST'
    });
}

// دالة جلب الرابط من Redis عند الضغط عليه
async function getFromDB(id) {
    const res = await fetch(`${REDIS_URL}/get/${id}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const data = await res.json();
    return data.result;
}

// --- المسارات (Routes) ---

// 1. عرض الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. مسار الرفع والاختصار
app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;
        if (!fileData) return res.status(400).json({ error: "No data" });

        // أ. رفع الملف إلى Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "my_uploads"
        });

        // ب. توليد معرف للاختصار وحفظه في Redis
        const shortId = generateID();
        await saveToDB(shortId, result.secure_url);

        // ج. إنشاء الرابط النهائي الخاص بموقعك
        const finalShortUrl = `${req.protocol}://${req.get('host')}/s/${shortId}`;

        res.json({ success: true, url: finalShortUrl });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

// 3. مسار التحويل (Redirect)
// عندما يضغط شخص على رابط مثل your-site.com/s/abc123
app.get('/s/:id', async (req, res) => {
    try {
        const longUrl = await getFromDB(req.params.id);
        if (longUrl) {
            res.redirect(longUrl);
        } else {
            res.status(404).send('الرابط غير موجود أو انتهت صلاحيته');
        }
    } catch (error) {
        res.status(500).send('خطأ في الاتصال بقاعدة البيانات');
    }
});

module.exports = app;
