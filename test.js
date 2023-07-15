
// Khởi tạo các biến cần thiết
const express = require('express');
const app = express();
const paypal = require('paypal-rest-sdk');
const bodyParser = require('body-parser');

// Cấu hình paypal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'YOUR_CLIENT_ID',
  'client_secret': 'YOUR_CLIENT_SECRET'
});

// Sử dụng body-parser để xử lý dữ liệu gửi lên server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Tạo một mảng để lưu trữ các sản phẩm trong giỏ hàng
let cart = [];

// Tạo một route để hiển thị trang chủ
app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với trang web của tôi!');
});

// Tạo một route để hiển thị danh sách sản phẩm
app.get('/products', (req, res) => {
  // Giả sử có một mảng các sản phẩm như sau
  let products = [
    { id: 1, name: 'Sách', price: 100000 },
    { id: 2, name: 'Bút', price: 20000 },
    { id: 3, name: 'Vở', price: 30000 }
  ];
  // Gửi mảng sản phẩm về client
  res.json(products);
});

// Tạo một route để thêm một sản phẩm vào giỏ hàng
app.post('/add-to-cart', (req, res) => {
  // Lấy id của sản phẩm từ body của request
  let productId = req.body.productId;
  // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng chưa
  let product = cart.find(item => item.id == productId);
  if (product) {
    // Nếu có thì tăng số lượng lên 1
    product.quantity++;
  } else {
    // Nếu không thì thêm sản phẩm vào giỏ hàng với số lượng là 1
    cart.push({ id: productId, quantity: 1 });
  }
  // Gửi thông báo thành công về client
  res.send('Thêm sản phẩm vào giỏ hàng thành công!');
});

// Tạo một route để hiển thị giỏ hàng
app.get('/cart', (req, res) => {
  // Gửi mảng giỏ hàng về client
  res.json(cart);
});

// Tạo một route để thanh toán hóa đơn bằng paypal
app.post('/pay', (req, res) => {
  // Tạo một đối tượng payment chứa các thông tin cần thiết cho việc thanh toán
  let payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
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
  for (let item of cart) {
    // Giả sử có một hàm để lấy thông tin của sản phẩm theo id
    let product = getProductById(item.id);
    // Thêm sản phẩm vào item_list
    payment.transactions[0].item_list.items.push({
      "name": product.name,
      "sku": product.id,
      "price": product.price,
      "currency": "VND",
      "quantity": item.quantity
    });
    // Cộng dồn tiền vào total
    payment.transactions[0].amount.total += product.price * item.quantity;
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
          res.send(payment.links[i].href);
        }
      }
    }
  });
});

// Tạo một route để xử lý kết quả trả về từ paypal sau khi người dùng thanh toán xong
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
      // Xóa giỏ hàng
      cart = [];
    }
  });
});

// Tạo một route để xử lý trường hợp người dùng hủy bỏ việc thanh toán
app.get('/cancel', (req, res) => {
  // Gửi thông báo hủy bỏ về client
  res.send('Bạn đã hủy bỏ việc thanh toán!');
});

// Khởi động server ở cổng 3000
app.listen(3000, () => {
  console.log('Server is running at port 3000');
});
Copy