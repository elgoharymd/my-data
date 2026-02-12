const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
// زيادة الحجم لضمان وصول الملف كاملاً بدون نقص
app.use(express.json({ limit: '100mb' }));

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

        // 1. الرفع مع التأكد من نوع الملف
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto", // يتعرف تلقائياً على (صورة، فيديو، raw)
            folder: "permanent_files",
            flags: "attachment:false" 
        });

        // 2. حل مشكلة "الملف غير الأصلي" والتحميل التلقائي:
        // نستخدم الرابط الآمن ونضيف f_auto (تنسيق تلقائي) 
        // ونحذف أي خيارات قد تجبر المتصفح على التحميل كملف غريب
        let finalUrl = result.secure_url;

        // إضافة fl_inline تضمن فتح الملف داخل المتصفح كـ (صورة أو PDF) وليس تحميله
        finalUrl = finalUrl.replace('/upload/', '/upload/f_auto,fl_inline/');

        res.json({ success: true, url: finalUrl });

    } catch (error) {
        console.error("Cloudinary Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
