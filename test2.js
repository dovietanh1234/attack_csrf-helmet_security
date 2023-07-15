// Khai báo các module cần thiết
const express = require('express');
const mysql = require('mysql');
const paypal = require('paypal-rest-sdk');
const bodyParser = require('body-parser');

// Cấu hình paypal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'YOUR_CLIENT_ID',
  'client_secret': 'YOUR_CLIENT_SECRET'
});

// Tạo một đối tượng kết nối với cơ sở dữ liệu mysql
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shopping'
});

// Kết nối với cơ sở dữ liệu
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Tạo một đối tượng express
const app = express();

// Sử dụng body-parser để lấy dữ liệu từ request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Định nghĩa các route cho ứng dụng
app.get('/', (req, res) => {
  res.send('Welcome to shopping cart app');
});

// Route để lấy danh sách sản phẩm
app.get('/products', (req, res) => {
  // Viết câu truy vấn sql để lấy tất cả sản phẩm từ bảng product
  let sql = 'SELECT * FROM product';
  // Thực thi câu truy vấn và gửi kết quả về client
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route để thêm sản phẩm vào giỏ hàng
app.post('/cart', (req, res) => {
  // Lấy thông tin sản phẩm từ request body
  const { user_id, product_id, quantity } = req.body;
  // Kiểm tra xem người dùng đã có giỏ hàng chưa
  let sql = 'SELECT * FROM cart WHERE user_id = ?';
  db.query(sql, [user_id], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      // Nếu người dùng đã có giỏ hàng, thêm sản phẩm vào bảng cart_item
      let cart_id = results[0].id;
      // Lấy giá của sản phẩm từ bảng product
      let sql = 'SELECT price FROM product WHERE id = ?';
      db.query(sql, [product_id], (err, results) => {
        if (err) throw err;
        let price = results[0].price;
        // Thêm sản phẩm vào bảng cart_item
        let sql = 'INSERT INTO cart_item (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
        db.query(sql, [cart_id, product_id, quantity, price], (err, results) => {
          if (err) throw err;
          res.send('Product added to cart');
        });
      });
    } else {
      // Nếu người dùng chưa có giỏ hàng, tạo một giỏ hàng mới và thêm sản phẩm vào bảng cart_item
      // Tạo một giỏ hàng mới với tổng tiền bằng 0
      let sql = 'INSERT INTO cart (user_id, total) VALUES (?, ?)';
      db.query(sql, [user_id, 0], (err, results) => {
        if (err) throw err;
        let cart_id = results.insertId;
        // Lấy giá của sản phẩm từ bảng product
        let sql = 'SELECT price FROM product WHERE id = ?';
        db.query(sql, [product_id], (err, results) => {
          if (err) throw err;
          let price = results[0].price;
          // Thêm sản phẩm vào bảng cart_item
          let sql = 'INSERT INTO cart_item (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
          db.query(sql, [cart_id, product_id, quantity, price], (err, results) => {
            if (err) throw err;
            res.send('Product added to cart');
          });
        });
      });
    }
  });
});

// Route để lấy danh sách sản phẩm trong giỏ hàng của người dùng
app.get('/cart/:user_id', (req, res) => {
  // Lấy user_id từ request params
  const { user_id } = req.params;
  // Viết câu truy vấn sql để lấy tất cả sản phẩm trong giỏ hàng của người dùng từ bảng cart_item
  let sql = 'SELECT p.id, p.name, p.price, c.quantity FROM product p JOIN cart_item c ON p.id = c.product_id JOIN cart ca ON c.cart_id = ca.id WHERE ca.user_id = ?';
  // Thực thi câu truy vấn và gửi kết quả về client
  db.query(sql, [user_id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route để xóa một sản phẩm khỏi giỏ hàng của người dùng
app.delete('/cart/:user_id/:product_id', (req, res) => {
  // Lấy user_id và product_id từ request params
  const { user_id, product_id } = req.params;
  // Viết câu truy vấn sql để xóa sản phẩm khỏi bảng cart_item
  let sql = 'DELETE c FROM cart_item c JOIN cart ca ON c.cart_id = ca.id WHERE ca.user_id = ? AND c.product_id = ?';
  // Thực thi câu truy vấn và gửi kết quả về client
  db.query(sql, [user_id, product_id], (err, results) => {
    if (err) throw err;
    res.send('Product removed from cart');
  });
});

app.post('/order', (req, res) => {
    // Lấy user_id và cart_id từ request body
    const { user_id, cart_id } = req.body; 
    let sql = 'INSERT INTO order (user_id, cart_id, status) VALUES (?, ?, ?)'; 
    
    db.query(sql, [user_id, cart_id, 'pending'], (err, results) => { 

        if (err) throw err; res.send('Order created successfully');
         
    });
        
});