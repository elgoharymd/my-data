const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// إعدادات Cloudinary - تأكد من وضع المفاتيح الإنجليزية فقط
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

        // الرفع لـ Cloudinary
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "my_uploads"
        });

        // محاولة الاختصار (بشكل آمن لا يسبب انهيار السيرفر)
        let finalUrl = result.secure_url;
        try {
            const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(finalUrl)}`);
            if (tinyRes.ok) {
                const short = await tinyRes.text();
                finalUrl = short.trim();
            }
        } catch (e) {
            console.log("TinyURL failed, using long URL");
        }

        res.json({ success: true, url: finalUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
