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

app.post('/upload', async (req, res) => {
    try {
        const { fileData } = req.body;

        // 1. الرفع لـ Cloudinary وتخزين النتيجة في متغير اسمه result
        const result = await cloudinary.uploader.upload(fileData, {
            resource_type: "auto",
            folder: "my_uploads"
        });

        // 2. الحصول على الرابط الطويل من النتيجة التي حصلنا عليها
        const longUrl = result.secure_url;

        // 3. اختصار الرابط (تأكدنا من أن longUrl موجود الآن)
        const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await tinyRes.text();

        // 4. إرسال الرابط القصير النهائي
        res.json({ success: true, url: shortUrl });

    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ error: "فشل الرفع: " + error.message });
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
