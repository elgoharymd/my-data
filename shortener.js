const express = require('express');
const router = express.Router();

// بيانات الاتصال بقاعدة البيانات
const REDIS_URL = "https://measured-boxer-55160.upstash.io";
const REDIS_TOKEN = "Add4AAIncDI4MzI2NWQ0MzE4OGM0YzExYWI4ODdlZDQ5OGJkMzcwN3AyNTUxNjA";

// دالة لحفظ الرابط مع معالجة "العرض المباشر"
async function saveUrl(id, longUrl) {
    // حل مشكلة التحميل التلقائي: تعديل رابط Cloudinary ليفتح كصورة فورا f_auto = أفضل جودة، fl_inline = فتح وليس تحميل
    let directUrl = longUrl;
    if (longUrl.includes('cloudinary.com')) {
        directUrl = longUrl.replace('/upload/', '/upload/f_auto,fl_inline/');
    }

    const response = await fetch(`${REDIS_URL}/set/${id}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        body: JSON.stringify(directUrl), // تخزين الرابط المعدل
        method: 'POST'
    });
    return response.ok;
}

// دالة لجلب الرابط
async function getUrl(id) {
    try {
        const res = await fetch(`${REDIS_URL}/get/${id}`, {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });
        const data = await res.json();
        // إزالة الاقتباسات الزائدة إذا وجدت في Redis
        return data.result ? data.result.replace(/"/g, '') : null;
    } catch (e) {
        console.error("Redis Get Error:", e);
        return null;
    }
}

// 1. مسار إنشاء الرابط المختصر
router.post('/shorten', async (req, res) => {
    try {
        const { longUrl } = req.body;
        if (!longUrl) return res.status(400).json({ error: "الرابط مطلوب" });

        const id = Math.random().toString(36).substring(2, 8);
        await saveUrl(id, longUrl); 
        
        // بناء الرابط النهائي (تأكد أن المسار يتطابق مع إعدادات server.js)
        const shortUrl = `${req.protocol}://${req.get('host')}/s/${id}`;
        res.json({ success: true, shortUrl });
    } catch (error) {
        res.status(500).json({ error: "فشل في إنشاء الرابط المختصر" });
    }
});

// 2. مسار التحويل التلقائي (Redirect)
router.get('/:id', async (req, res) => {
    try {
        const longUrl = await getUrl(req.params.id);
        if (longUrl) {
            // التحويل للرابط المباشر الذي أصلحناه في دالة saveUrl
            res.redirect(longUrl);
        } else {
            res.status(404).send('<h1>404</h1><p>الرابط غير موجود أو انتهت صلاحيته</p>');
        }
    } catch (error) {
        res.status(500).send('خطأ في تحويل الرابط');
    }
});

module.exports = router;
