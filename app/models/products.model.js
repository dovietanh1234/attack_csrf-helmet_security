const db = require('../common/connect');

const Product = function(book){
    this.product_id = book.product_id;
    this.product_name = book.product_name;
    this.product_price = book.product_price;
}

Product.get_all = function(result){
    let query1 = 'SELECT * FROM products';
    db.query(query1, (err, data)=>{
        if(err || data.length == 0){
            result(null);
        }else{
            result(data);
        }
    })
}

module.exports = Product;