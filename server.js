const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- إعدادات Cloudinary ---
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: '281538369882913', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM'  P-ك بالكود الطويل من الموقع
});

// تشغيل الواجهة
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// عملية الرفع والاختصار
app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;

        // 1. الرفع لـ Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "my_uploads"
        });

        // 2. اختصار الرابط وتنظيفه
        const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(result.secure_url)}`);
        const shortUrl = await tinyRes.text();

        // 3. إرسال الرابط النهائي النظيف
        res.json({ success: true, url: shortUrl.trim() });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
