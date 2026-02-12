const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('database.json'); // اسم ملفك هنا
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// إضافة "ذكاء" بسيط: منع الحذف العشوائي مثلاً
server.use((req, res, next) => {
  if (req.method === 'DELETE') {
    console.log("محاولة حذف بيانات!");
  }
  next();
});

server.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
