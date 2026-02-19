
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // تأكد من إضافة axios
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 

// --- 1. إعدادات Cloudinary ---
cloudinary.config({ 
  cloud_name: 'dipkjcauf', 
  api_key: '281538369882913', 
  api_secret: 'P-eHCflFjiVa5EkJP_9FlXy6DTM' 
});

// --- 2. إعدادات Upstash Redis ---
const REDIS_URL = "https://measured-boxer-55160.upstash.io";
const REDIS_TOKEN = "Add4AAIncDI4MzI2NWQ0MzE4OGM0YzExYWI4ODdlZDQ5OGJkMzcwN3AyNTUxNjA";

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// مسار حفظ الرابط وتوليد المعرف المختصر
app.post('/save-link', async (req, res) => {
    try {
        const { url } = req.body;
        // توليد معرف فريد من 6 خانات
        const shortId = Math.random().toString(36).substring(2, 8);
        
        // حفظ الرابط في Redis
        await axios.post(`${REDIS_URL}/set/${shortId}`, JSON.stringify(url), {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });

        // إنشاء الرابط المختصر الذي سيتحول لـ QR
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const finalShortUrl = `${protocol}://${host}/s/${shortId}`;
        
        res.json({ success: true, url: finalShortUrl });
    } catch (error) {
        console.error("Redis Error:", error.message);
        res.status(500).json({ error: "فشل في حفظ الرابط في قاعدة البيانات" });
    }
});

// مسار التحويل (Redirect) - هذا ما يجعل الـ QR يعمل دائماً
app.get('/s/:id', async (req, res) => {
    try {
        const response = await axios.get(`${REDIS_URL}/get/${req.params.id}`, {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });
        const longUrl = response.data.result;
        
        if (longUrl) {
            return res.redirect(longUrl);
        }
        res.status(404).send('الرابط غير موجود أو انتهت صلاحيته');
    } catch (error) {
        res.status(500).send('خطأ في السيرفر أثناء جلب البيانات');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
