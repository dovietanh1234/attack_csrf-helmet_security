// app.get("/payment", paymentController.payment);

// app.get("/payment/success", paymentController.payment-success);

// app.post("/payment/cancel", paymentController.payment-cancel);

var Payment = require('../models/payment.model');



exports.payment = function(req, res){
let userId = req.body.userId;
Payment.handle_payment(userId, (data)=>{
    if(data == null){
        res.send({ result: null });
        console.log("sai o dau do")
    }else if(data == undefined){
        res.send({ result: "khong co du lieu" });
    }else{
        res.send(data);
    }
})
}

exports.payment_success = function(req, res){
  let payerId = req.query.PayerID;
  let paymentId = req.query.paymentId;

Payment.success({payerId, paymentId}, (data)=>{
    if(data == null){
        res.send(null);
    }else{
        res.send(data);
    }
})
}


exports.payment_cancel = function(req, res){
    res.send('bạn đã hủy bỏ thanh toán!');
}
