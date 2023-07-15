// Khởi tạo các biến cần thiết
const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');

// Tạo một kết nối đến mysql của xamp server
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
});

// Kết nối đến mysql
connection.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Connected to mysql');
  }
});


// Cấu hình paypal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ASD-g4x3uJKcvt8mer3q3yrbaBoGibHIXioQ1DCCa4Br3I4Ug7B5ZHycSoL0-hCX1-CpPLSdqM-r8IQv',
  'client_secret': 'ELbIOpfybz6vaow_G8dsDmU2vjSCIjGpdFn5J_eTfFL2QRQOm2HIY7EyCJNglyznXlNzLCa2FTjKn6Vw'
});

// Sử dụng body-parser để xử lý dữ liệu gửi lên server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Tạo một route để hiển thị trang chủ
app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với trang web của tôi!');
});

// Tạo một route để hiển thị danh sách sản phẩm
app.get('/products', (req, res) => {
  // Tạo một câu truy vấn để lấy tất cả các sản phẩm từ bảng products trong mysql
  let query = 'SELECT * FROM products';
  // Thực hiện câu truy vấn
  connection.query(query, (error, results) => {
    if (error) {
      // Nếu có lỗi thì gửi lỗi về client
      res.send(error);
    } else {
      // Nếu không có lỗi thì gửi kết quả về client
      res.json(results);
    }
  });
});

// Tạo một route để thêm một sản phẩm vào giỏ hàng
app.post('/add-to-cart', (req, res) => {
  // Lấy id của sản phẩm và id của người dùng từ body của request
  let productId = req.body.productId;
  let userId = req.body.userId;
  // Tạo một câu truy vấn để kiểm tra xem sản phẩm có tồn tại trong bảng cart trong mysql chưa
  let query = 'SELECT * FROM cart WHERE product_id = ? AND user_id = ?';
  // Thực hiện câu truy vấn
  connection.query(query, [productId, userId], (error, results) => {
    if (error) {
      // Nếu có lỗi thì gửi lỗi về client
      res.send(error);
    } else {
      if (results.length > 0) {
        // Nếu có kết quả trả về thì tăng số lượng lên 1
        let quantity = results[0].quantity + 1;
        // Tạo một câu truy vấn để cập nhật số lượng trong bảng cart
        let query = 'UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id = ?';
        // Thực hiện câu truy vấn
        connection.query(query, [quantity, productId, userId], (error, results) => {
          if (error) {
            // Nếu có lỗi thì gửi lỗi về client
            res.send(error);
          } else {
            // Nếu không có lỗi thì gửi thông báo thành công về client
            res.send('Thêm sản phẩm vào giỏ hàng thành công!');
          }
        });
      } else {
        // Nếu không có kết quả trả về thì thêm sản phẩm vào bảng cart với số lượng là 1
        // Tạo một câu truy vấn để thêm sản phẩm vào bảng cart
        let query = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
        // Thực hiện câu truy vấn
        connection.query(query, [userId, productId, 1], (error, results) => {
          if (error) {
            // Nếu có lỗi thì gửi lỗi về client
            res.send(error);
          } else {
            // Nếu không có lỗi thì gửi thông báo thành công về client
            res.send('Thêm sản phẩm vào giỏ hàng thành công!');
          }
        });
      }
    }
  });
});

// Tạo một route để hiển thị giỏ hàng
app.get('/cart', (req, res) => {
  // Lấy id của người dùng từ query của request
  let userId = req.query.userId;
  // Tạo một câu truy vấn để lấy tất cả các sản phẩm trong bảng cart trong mysql theo user_id
  let query = 'SELECT * FROM cart WHERE user_id = ?';
  // Thực hiện câu truy vấn
  connection.query(query, [userId], (error, results) => {
    if (error) {
      // Nếu có lỗi thì gửi lỗi về client
      res.send(error);
    } else {
      // Nếu không có lỗi thì gửi kết quả về client
      res.json(results);
    }
  });
});




// FUNCTION CAN THIET CHO DU AN 

function getProductById(id) {
  // Tạo một truy vấn SQL
  let sql = 'SELECT * FROM products WHERE product_id = ?';
  // Gửi truy vấn đến cơ sở dữ liệu
  connection.query (sql, [id], function (err, results) {
   if (err) {
    // Xử lý lỗi
    console.error (err);
    return null;
   }
   // Trả về kết quả
   return results [0];
  });
 }




// Tạo một route để thanh toán hóa đơn bằng paypal
app.post('/pay', (req, res) => {
  // Lấy id của người dùng từ body của request
  let userId = req.body.userId;
  // Tạo một đối tượng payment chứa các thông tin cần thiết cho việc thanh toán
  let payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3005/success",
      "cancel_url": "http://localhost:3005/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": []
      },
      "amount": {
        "currency": "VND",
        "total": 0
      },
      "description": "Thanh toán hóa đơn cho trang web của tôi"
    }]
  };


  // Duyệt qua mảng giỏ hàng để thêm các sản phẩm vào item_list và tính tổng tiền
  // Tạo một câu truy vấn để lấy tất cả các sản phẩm trong bảng cart trong mysql theo user_id
  let query = 'SELECT * FROM cart WHERE user_id = ?';
  // Thực hiện câu truy vấn
  connection.query(query, [userId], (error, results) => {
    if (error) {
      // Nếu có lỗi thì gửi lỗi về client
      res.send(error);
    } else {
      for (let item of results) {
        // Giả sử có một hàm để lấy thông tin của sản phẩm theo id
        let product = getProductById(item.product_id);
        // Thêm sản phẩm vào item_list
        payment.transactions[0].item_list.items.push({
          "name": product.product_name,
          "sku": product.product_id,
          "price": product.product_price,
          "currency": "VND",
          "quantity": item.quantity
        });
        // Cộng dồn tiền vào total
        payment.transactions[0].amount.total += product.product_price * item.quantity;
      }
      // Gọi hàm create của paypal để tạo một payment
      paypal.payment.create(payment, function (error, payment) {
        if (error) {
          // Nếu có lỗi thì gửi lỗi về client
          res.send(error);
        } else {
          // Nếu không có lỗi thì duyệt qua mảng links của payment để tìm link chuyển hướng đến trang thanh toán của paypal
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              // Gửi link đó về client
              res.redirect(payment.links[i].href);// res.send()
            }
          }
        }
      });
    }
  });
});

// Tạo một route để xử lý kết quả trả về từ paypal sau khi
// người dùng thanh toán xong
app.get('/success', (req, res) => {
  // Lấy các tham số payerId và paymentId từ query của request
  let payerId = req.query.PayerID;
  let paymentId = req.query.paymentId;

  // Tạo một đối tượng execute chứa payerId
  let execute = {
    "payer_id": payerId
  };

  // Gọi hàm execute của paypal để hoàn tất việc thanh toán
  paypal.payment.execute(paymentId, execute, function (error, payment) {
    if (error) {
      // Nếu có lỗi thì gửi lỗi về client
      res.send(error);
    } else {
      // Nếu không có lỗi thì gửi thông báo thành công về client
      res.send('Thanh toán hóa đơn thành công!');
      // Lấy id của người dùng từ payment
      let userId = payment.payer.payer_info.payer_id;
      // Tạo một câu truy vấn để lấy tất cả các sản phẩm trong bảng cart trong mysql theo user_id
      let query = 'SELECT * FROM cart WHERE user_id = ?';
      // Thực hiện câu truy vấn
      connection.query(query, [userId], (error, results) => {
        if (error) {
          // Nếu có lỗi thì gửi lỗi về client
          res.send(error);
        } else {
          // Tạo một biến để lưu tổng tiền của đơn hàng
          let totalAmount = 0;
          // Duyệt qua mảng kết quả để tính tổng tiền
          for (let item of results) {
            // Giả sử có một hàm để lấy thông tin của sản phẩm theo id
            let product = getProductById(item.product_id);
            // Cộng dồn tiền vào totalAmount
            totalAmount += product.product_price * item.quantity;
          }
          // Tạo một câu truy vấn để thêm một đơn hàng vào bảng order trong mysql
          let query = 'INSERT INTO order (user_id, payment_id, total_amount, order_date, status_id) VALUES (?, ?, ?, ?, ?)';
          // Thực hiện câu truy vấn
          connection.query(query, [userId, paymentId, totalAmount, new Date(), 1], async (error, results) => {
            if (error) {
              // Nếu có lỗi thì gửi lỗi về client
              res.send(error);
            } else {
              // Lấy id của đơn hàng vừa được thêm vào
              let orderId = results.insertId;

              let promises_arr = [];

              // Duyệt qua mảng kết quả để thêm các sản phẩm vào bảng invoice trong mysql
              for (let item of results) {

                let promise = new Promise( (resolve, reject)=>{
                  getProductById(item.product_id)
                    .then(product=>{
                      let query = 'INSERT INTO invoice (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
                  // Tạo một câu truy vấn để thêm một sản phẩm vào bảng invoice
                // thêm 1 trường status_id vào đây nữa và điền giá trị là đã thanh toán:  Lưu ý bài này đang thiếu trường status nên ta cần thêm vào!
                
                // Thực hiện câu truy vấn
                connection.query(query, [orderId, item.product_id, item.quantity, product.product_price], (error, results) => {
                  if (error) {
                    // Nếu có lỗi thì gửi lỗi về client
                    res.send(error);
                  } else {
                    // Nếu không có lỗi thì gửi thông báo thành công về client
                    resolve('thêm sản phẩm thành công');
                  }
                });

                    })
                    .catch(error=>{
                      reject(error);
                    })
                })

                promises_arr.push(promise);
              }
              Promise.all(promises_arr)
                .then(result =>{
                  res.send(result);
                })
                .catch(error=>{
                  res.send(error);
                })

              // Xóa giỏ hàng
              // Tạo một câu truy vấn để xóa tất cả các sản phẩm trong bảng cart trong mysql theo user_id
              let query = 'DELETE FROM cart WHERE user_id = ?';
              // Thực hiện câu truy vấn
              connection.query(query, [userId], (error, results) => {
                if (error) {
                  // Nếu có lỗi thì gửi lỗi về client
                  res.send(error);
                } else {
                  // Nếu không có lỗi thì gửi thông báo thành công về client
                  res.send('Xóa giỏ hàng thành công!');
                }
              });
            }
          });
        }
      });
    }
  });
});

// Tạo một route để xử lý trường hợp người dùng hủy bỏ việc thanh toán
app.get('/cancel', (req, res) => {
  // Gửi thông báo hủy bỏ về client
  res.send('Bạn đã hủy bỏ việc thanh toán!');
});

// Khởi động server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});






















for (let item of results) {
  // Tạo một Promise mới cho mỗi truy vấn
  let promise = new Promise((resolve, reject) => {
    // Lấy thông tin sản phẩm theo id
    getProductById(item.product_id)
      .then(product => {
        // Tạo truy vấn SQL
        let query = 'INSERT INTO invoice (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
        // Gửi truy vấn đến cơ sở dữ liệu
        connection.query(query, [orderId, item.product_id, item.quantity, product.product_price], (error, result) => {
          if (error) {
            // Nếu có lỗi, gọi reject()
            reject(error);
          } else {
            // Nếu thành công, gọi resolve()
            resolve('Thêm sản phẩm vào hóa đơn thành công!');
          }
        });
      })
      .catch(error => {
        // Nếu có lỗi, gọi reject()
        reject(error);
      });
  });
  // Thêm Promise vào mảng
  promises.push(promise);
}
// Chờ cho tất cả các Promise hoàn thành
Promise.all(promises)
  .then(results => {
    // Gửi kết quả cho response
    res.send(results);
  })
  .catch(error => {
    // Xử lý lỗi
    res.send(error);
  });
