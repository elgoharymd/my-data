const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const shortener = require('./shortener');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// إعدادات Cloudinary
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: '281538369882913', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM' 
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;
        if (!fileData) return res.status(400).json({ error: "No data" });

        // الرفع لـ Cloudinary مع تفعيل خيار تصغير الاسم
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "up", // اسم مجلد قصير جداً لتصغير الرابط
            use_filename: false, 
            unique_filename: true
        });

        // إرسال الرابط المباشر الآمن فوراً بدون اختصارات خارجية
        res.json({ success: true, url: result.secure_url });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.use('/s', shortener); // أي رابط يبدأ بـ /s سيذهب لنظام الاختصار

module.exports = app;
