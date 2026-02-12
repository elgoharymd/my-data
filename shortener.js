const express = require('express');
const router = express.Router();

// قاعدة بيانات مؤقتة لتخزين الروابط (في المشاريع الكبيرة نستخدم MongoDB)
const urlDatabase = {};

// 1. وظيفة توليد كود عشوائي قصير
function generateID() {
    return Math.random().toString(36).substring(2, 8);
}

// 2. مسار لإنشاء الرابط المختصر
router.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    const id = generateID();
    urlDatabase[id] = longUrl;
    
    // سيعطيك رابطاً مثل: your-site.vercel.app/s/abc123
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${id}`;
    res.json({ shortUrl });
});

// 3. مسار التحويل (عندما يضغط شخص على الرابط)
router.get('/:id', (req, res) => {
    const longUrl = urlDatabase[req.params.id];
    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).send('الرابط غير موجود أو انتهت صلاحيته');
    }
});

module.exports = router;
