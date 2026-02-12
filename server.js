const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- ضع مفاتيحك الجديدة هنا بعناية ---
cloudinary.config({ 
  cloud_name: 'md', 
  api_key: '281538369882913', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM' 
});

// السيرفر يفتح صفحة الواجهة فوراً
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// مسار الرفع (Upload)
app.post('/upload', async (req, res) => {
    try {
        const { fileData, apiKey } = req.body;

        // تأكد أن هذه الكلمة هي نفسها الموجودة في ملف index.html
        if (apiKey !== "my_secret_password_1234") {
            return res.status(403).json({ error: "فشل التحقق من الهوية" });
        }

        // إرسال الصورة للسحاب
// استبدل الجزء القديم بهذا
const result = await cloudinary.uploader.upload(fileData, {
    resource_type: "auto",
    folder: "my_uploads" // سيتم إنشاء مجلد بهذا الاسم في حسابك تلقائياً
});

        res.json({ success: true, url: result.secure_url });

    } catch (error) {
        console.error("Cloudinary Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
