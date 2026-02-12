
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- إعدادات Cloudinary (ضع بياناتك هنا) ---
cloudinary.config({ 
  cloud_name: 'mdmods2468', 
  api_key: '745371657797883', 
  api_secret: 'mVDicHqeQDyCSTFM4He8I71JmiM' 
});

const API_KEY = "my_secret_password_123"; // كلمة سر الرفع من هاتفك

app.get('/', (req, res) => res.send("سيرفرك السحابي جاهز!"));

// مسار الرفع الذكي
app.post('/upload', async (req, res) => {
    try {
        const { fileData, apiKey } = req.body;

        if (apiKey !== API_KEY) {
            return res.status(403).json({ error: "غير مصرح لك" });
        }

        // الرفع إلى Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto", 
        });

        // إرجاع الرابط الحقيقي والدائم
        res.json({
            success: true,
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "فشل الرفع للسحاب" });
    }
});

module.exports = app;
