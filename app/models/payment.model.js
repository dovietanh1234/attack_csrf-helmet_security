const db = require("../common/connect");
const paypal = require('paypal-rest-sdk');
const {google} = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = process.env.REDIRECT_URL
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const sendMail = async(invoiceEmail) => {
    try{
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'anhdvth2205005@fpt.edu.vn',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

          // send mail with defined transport object
  let info = await transport.sendMail({
    from: '"Fasion Luxury" <anhdvth2205005@fpt.edu.vn>', // sender address
    to: `${invoiceEmail.user_email}`, // list of receivers
    subject: "Notification of successfully payment of your bill ✔", // Subject line
    text: `Hello ${invoiceEmail.user_name}`, // plain text body
    html: `<h5>Payment methods: Paypal</h5></br><h5>Payment status: Payment success </h5></br>
    <div style=" margin: auto;width: 50%;"><div> <h3 style="margin-left: 230px">INVOICE</h3>
    <div style="display: flex"><div style="border: 2px solid black; padding: 10px">
    <h3>SUMARY</h3><h4>Order id: ${invoiceEmail.payment_id} </h4><h4>Order Date: ${invoiceEmail.order_date}</h4><h4>total amount: ${invoiceEmail.total_amount} $    </h4></div><div style="border: 2px solid black; padding: 10px">
    <h3>SHIPPING ADDRESS</h3><h4>Receiver: ${invoiceEmail.user_name} </h4><h4>Address: ${invoiceEmail.address} </h4><h4>Phone number: ${invoiceEmail.phone}</h4>
    </div></div></div></div></br></br><span style="position: absolute; right: 600px;">---thank you---</span>
    `, // html body
  });

  console.log(info);
    }catch(error){
        console.error(error);
    }
}




paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASD-g4x3uJKcvt8mer3q3yrbaBoGibHIXioQ1DCCa4Br3I4Ug7B5ZHycSoL0-hCX1-CpPLSdqM-r8IQv',
    'client_secret': 'ELbIOpfybz6vaow_G8dsDmU2vjSCIjGpdFn5J_eTfFL2QRQOm2HIY7EyCJNglyznXlNzLCa2FTjKn6Vw'
  });

// function object constructor
const Payment = function(){
}

function getProductById(id) {
    return new Promise(function(resolve, reject){
    // Tạo một truy vấn SQL
    let sql = 'SELECT * FROM products WHERE product_id = ?';
    // Gửi truy vấn đến cơ sở dữ liệu
    db.query (sql, [id], function (err, results) {
     if (err) {
      // Xử lý lỗi
      reject(err);
     }
     // Trả về kết quả
     resolve(results[0]);
    });
    })
   }

   function getInvoice(id){
    return new Promise(function(resolve, reject){
        let sql = 'SELECT u.user_name, u.user_email, u.phone, u.address, o.total_amount, o.order_date, o.payment_id FROM users1 as u INNER JOIN order1 as o ON u.user_id = o.user_id WHERE o.user_id = ? ORDER BY order_date DESC LIMIT 1;';
        db.query(sql, [id], function(err, result){
            if(err){
                console.log('lỗi ở đoạn lấy dữ liệu từ order ra');
                reject(err);
            }
            console.log("tôi đã ở đây 1")
            console.log(result[0]);
            resolve(result[0]);
        })
    })
   }
   

Payment.handle_payment = function(userId, response){
    const user = require('../common/variable.global');
    user.id = userId;

    console.log(user.id);

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
            "currency": "USD",
            "total": 0
          },
          "description": "Thanh toán hóa đơn cho trang web của tôi"
        }]
      };

      let query = 'SELECT * FROM cart WHERE user_id = ?';

      db.query(query, [userId], async (error, results)=>{
            if(error){
                console.log(1);
                return response(null);
                
            }else{
                for (let item of results) {
                    // Giả sử có một hàm để lấy thông tin của sản phẩm theo id
                    let product = await getProductById(item.product_id);
                    // Thêm sản phẩm vào item_list
                    payment.transactions[0].item_list.items.push({
                        "name": product.product_name,
                        "sku": product.product_id,
                        "price": product.product_price,
                        "currency": "USD",
                        "quantity": item.quantity
                    });
                    // Cộng dồn tiền vào total
                    payment.transactions[0].amount.total += product.product_price * item.quantity;
                  }

                  paypal.payment.create(payment, function(error, payment){
                        if(error){
                            console.log(2);
                            return response(null);
                        }else{
                            for(let i=0; i<payment.links.length; i++){
                               // console.log(payment.links[i].href);
                                if(payment.links[i].rel === 'approval_url'){
                                    console.log(payment.links[i].href);
                                   return response(payment.links[i].href);
                                }
                            }
                        }
                  })
            }
      } )
}



Payment.success = function ({payerId, paymentId}, response){

    const user = require('../common/variable.global');
    console.log(user.id);

  let execute = {
    "payer_id": payerId
  };

  paypal.payment.execute(paymentId, execute, function(error, payment){

        if(error){
           return response(null);
        }else{
            response(" <div style='text-align: center'><h1>Thanh toán hóa đơn thành công</h1><br/><img src='https://cdn-icons-png.flaticon.com/512/148/148767.png' alt='girl' width='300' height='300'></div><a href='#'>return Home page</a>");

            // let userId = payment.payer.payer_info.payer_id;
            // console.log(userId);

            let query = 'SELECT * FROM cart WHERE user_id = ?';

            db.query(query, [user.id], async (error, results1)=>{
                if(error){
                   return response(null);
                }else{

                    let totalAmount = 0;


                    for(let item of results1){
                        let product = await getProductById(item.product_id);

                        totalAmount += product.product_price * item.quantity;
                        let product_quantity = product.quantity - 1;
                        let query_product = 'UPDATE products SET quantity = ? WHERE product_id = ?';
                        db.query(query_product, [product_quantity, item.product_id], (err, data_product)=>{
                                if(err){
                                    return response({
                                        code: 500,
                                        message: 'fail to update quantity...',
                                        status: 0
                                    })
                                }
                        })
                    }

                    let query = 'INSERT INTO order1 (user_id, payment_id, total_amount, status_id) VALUES (?, ?, ?, ?)';

                    db.query(query, [user.id, paymentId, totalAmount, 1], async (error, results)=>{
                        if(error){
                            console.log('sai logic 2');
                            return response(null);
                        }else{
                            let orderId = results.insertId;
                                    console.log('chưa chạy vào đây')//
                                        for(let item of results1){
                                        let query = 'INSERT INTO invoice (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
                                        let product = await getProductById(item.product_id);
                                        let numberQuantity = item.quantity * product.product_price;
                                     db.query(query, [orderId, item.product_id, item.quantity, numberQuantity], (error, result)=>{
                                    if(error){
                                        console.log('sai logic');
                                       return response(null);
                                    }else{
                                        console.log('tạo invoice thành công');
                                    }
                                })

                            }

                            // Comment 2 dòng code này lại! để Test thử xem đã chạy được CART trên server chưa
                            // nếu chạy được mở bảng invoice & order trong server ra ma thấy nó chạy được rồi! thì tắt comment 2 dòng code này đi
                            // để cho nó gửi mail
                            let invoiceEmail = await getInvoice(user.id);
                                 sendMail(invoiceEmail);

                            let query = 'DELETE FROM cart WHERE user_id = ?';
                            db.query(query, [user.id], (error, result)=>{
                                if(error){
                                        return response(null);
                                }else{
                                    console.log('xoa cart cua user ' + user.id + ' thanh cong');
                                }
                            })
                        }
                    });

                }
            })

        }

  })

} 



module.exports = Payment;

