const { express } = require("express");
var Cart = require('../models/cart.model');

exports.handle_add_to_cart = function(req, res){
    let userId = req.body.userId;
    let productId = req.body.productId;
    Cart.handle_cart({userId, productId}, (result)=>{
            return res.send({
                result: result
            })
    });

}

exports.get_all_cart = function(req, res){
    let userId = req.params.user_id;
    // req.params.id
    Cart.getCart_user(userId, (data)=>{
        res.send({
            result: data
        })
    } )

}


//  xoa all products in cart
exports.remove_all_p = function(req, res){
    let userId = req.body.userId;
    Cart.delete_all(userId, (response)=>{
        res.send({result: response});
    })
}
// giam so luong trong cart
exports.decrease_product = function(req, res){
    let userId = req.body.user_id;
    let productId = req.body.product_id;
    Cart.decrease_amount({userId, productId}, (response)=>{
        res.send({result: response});
    })

}

// delete product cua userId
exports.delete_a_product = function(req, res){
    let userId = req.body.user_id;
    let productId = req.body.product_id;
    Cart.delete_product({userId, productId}, (response)=>{
        res.send({result: response});
    })
}