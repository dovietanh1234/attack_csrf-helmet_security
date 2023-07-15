module.exports = function(app){
    var cart_order_controller = require('../controllers/products.controller');
    var cart = require('../controllers/cart.controller');


    //product

    app.get("/products", cart_order_controller.get_product);

    app.post("/add-to-cart", cart.handle_add_to_cart);

    // cart

    app.get("/cart/:user_id", cart.get_all_cart);

    app.post("/remove/all/product", cart.remove_all_p);

    app.post("/decrease/product", cart.decrease_product);

    app.post("/delete/one/product", cart.delete_a_product);

    // app.post("/pay", bookController.pay_pal);



    // app.get("/success", bookController.paypal_success);

    // app.get("/cancel", bookController.paypal_cancel);
}