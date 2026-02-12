const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// إعدادات Cloudinary
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: '281538369882913', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM' // تأكد أن هذا هو الكود السري الكامل من الموقع
});

// تشغيل صفحة الواجهة
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// مسار الرفع والاختصار
app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;

        if (!fileData) {
            return res.status(400).json({ error: "لا يوجد بيانات للملف" });
        }

        // 1. الرفع لـ Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "my_uploads"
        });

        const longUrl = result.secure_url;

        // 2. اختصار الرابط عبر TinyURL
        const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await tinyRes.text();

        // 3. إرسال الرابط النهائي
        res.json({ success: true, url: shortUrl });

    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
