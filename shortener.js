const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
// رفع القيود تماماً عن حجم الملفات لضمان وصولها كاملة
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

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

        // الرفع المباشر بدون أي فلاتر أو تعديلات (Raw Mode)
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto", // يتعرف على النوع تلقائياً
            folder: "direct_uploads",
            use_filename: true,
            unique_filename: true,
            // إلغاء أي تحويلات تلقائية قد تفسد الملف
            delivery_type: "upload"
        });

        // إرسال الرابط الأصلي كما جاء من Cloudinary تماماً
        // ملحوظة: إذا أردت فتحه في المتصفح، سيعتمد ذلك على نوع الملف الأصلي
        res.json({ success: true, url: result.secure_url });

    } catch (error) {
        console.error("Cloudinary Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
