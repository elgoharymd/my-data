const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- ضع مفاتيحك الجديدة هنا بعناية ---
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
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
        if (apiKey !== "my_secret_password_123") {
            return res.status(403).json({ error: "فشل التحقق من الهوية" });
        }

app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;

        // 1. رفع الملف إلى Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "my_uploads"
        });

        const longUrl = result.secure_url;

        // 2. اختصار الرابط عبر TinyURL
        // نستخدم fetch المدمج في Node.js (متوفر في الإصدارات الحديثة على Vercel)
        const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await tinyRes.text();

        // 3. إرسال الرابط القصير للمستخدم
        res.json({ success: true, url: shortUrl });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "حدث خطأ: " + error.message });
    }
});

// تأكد أننا نرسل الرابط الآمن (https)
res.json({ success: true, url: result.secure_url });
        res.json({ success: true, url: result.secure_url });

    } catch (error) {
        console.error("Cloudinary Error:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
    }
});

module.exports = app;
