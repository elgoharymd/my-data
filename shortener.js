const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. إعدادات Cloudinary (تأكد من صحة المفاتيح)
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: '281538369882913', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM' 
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. مسار الرفع المباشر والدائم
app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;
        if (!fileData) return res.status(400).json({ error: "No data" });

        // الرفع مع إعدادات تمنع الحذف أو التغيير
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "permanent_files", // مجلد خاص للملفات الدائمة
            access_mode: "public"      // التأكد من أن الرابط متاح للجميع دائماً
        });

        // تعديل الرابط لضمان "العرض المباشر" ومنع "التحميل التلقائي"
        // f_auto: يختار أفضل صيغة للمتصفح / fl_inline: يفتح الصورة ولا يحملها
        const permanentUrl = result.secure_url.replace('/upload/', '/upload/f_auto,fl_inline/');

        res.json({ success: true, url: permanentUrl });

    } catch (error) {
        console.error("Cloudinary Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
