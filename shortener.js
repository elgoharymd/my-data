const express = require('express');
const router = express.Router();

// بيانات الاتصال بقاعدة البيانات (ضع قيمك هنا)
const REDIS_URL = "رابط_UPSTASH_هنا";
const REDIS_TOKEN = "توكن_UPSTASH_هنا";

// دالة لحفظ الرابط في القاعدة السحابية
async function saveUrl(id, longUrl) {
    await fetch(`${REDIS_URL}/set/${id}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        body: JSON.stringify(longUrl),
        method: 'POST'
    });
}

// دالة لجلب الرابط
async function getUrl(id) {
    const res = await fetch(`${REDIS_URL}/get/${id}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const data = await res.json();
    return data.result;
}

// 1. مسار إنشاء الرابط المختصر
router.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;
    const id = Math.random().toString(36).substring(2, 8);
    
    await saveUrl(id, longUrl); // حفظ دائم
    
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${id}`;
    res.json({ shortUrl });
});

// 2. مسار التحويل التلقائي
router.get('/:id', async (req, res) => {
    const longUrl = await getUrl(req.params.id);
    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).send('الرابط غير موجود أو انتهت صلاحيته');
    }
});

module.exports = router;
