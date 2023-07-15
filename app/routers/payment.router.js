module.exports = function app(app){
    var paymentController = require('../controllers/payment.controller');

    app.post("/payment", paymentController.payment);

    app.get("/success", paymentController.payment_success);

    app.get("/cancel", paymentController.payment_cancel);
}