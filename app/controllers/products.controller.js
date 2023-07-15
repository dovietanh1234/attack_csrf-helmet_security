const { express } = require('express');
var Product = require('../models/products.model'); 

exports.get_product = function(req, res){
    Product.get_all( (data)=>{
        res.send({
            result: data
        })
    } )

}