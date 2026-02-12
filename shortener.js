const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. إعدادات Cloudinary
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: '28153836988293', 
  api_secret: 'ضع_هنا_API_SECRET_الحقيقي' 
});

// عرض الواجهة الأمامية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. مسار الرفع المباشر
app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;
        if (!fileData) return res.status(400).json({ error: "لا توجد بيانات للملف" });

        // الرفع لـ Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "up" // مجلد قصير لتقليل طول الرابط
        });

        // تعديل الرابط ليفتح كصورة مباشرة (Inline) وليس للتحميل
        // نقوم بإضافة f_auto (تلقائي الجودة) و fl_inline (عرض مباشر)
        const finalUrl = result.secure_url.replace('/upload/', '/upload/f_auto,fl_inline/');

        // إرسال الرابط المباشر للمستخدم
        res.json({ success: true, url: finalUrl });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
