const db = require("../common/connect");

const Cart = function(cart){
    this.cart_id = cart.cart_id;
    this.user_id = cart.user_id;
    this.product_id = cart.product_id;
    this.quantity = cart.quantity;
}

Cart.handle_cart = function({userId, productId}, result){
    let query1 = 'SELECT * FROM cart WHERE product_id = ? AND user_id = ?';
    db.query(query1, [productId, userId], (err, data)=>{
        if(err){
            return result(null);
        }else{
            if(data.length > 0){
                    let quantity = data[0].quantity + 1;
                    let query2 = 'UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id = ?';
                    db.query(query2, [quantity, productId, userId], (err, data)=>{
                        if(err){
                            return  result(null);
                        }else{
                            return  result("Thêm sản phẩm vào giỏ hàng thành công");
                        }
                    })
            }else{
                let query3 = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
                db.query(query3, [userId, productId, 1], (err, data)=>{
                    if(err){
                       return result(null);
                    }else{
                        return result('thêm sản phẩm vào giỏ hàng thành công');
                    }
                })
            }
        }
    })
}


// xóa hết sản phẩm trong cart -> delete_all()

// giảm số lượng của một sản phẩm trong cart -> nếu số lượng của 1 sản phẩm còn lại 1 thì ấn giảm nữa thì phải xóa sản phẩm ra khỏi cart -> decrease_amount

// xóa một sản phẩm ra khỏi cart -> delete_product() 



Cart.delete_all = function(userId, result){
    console.log(userId);
    let query1 = 'SELECT p.product_name, c.quantity FROM products as p INNER JOIN cart as c ON p.product_id = c.product_id WHERE c.user_id = ?';
    db.query(query1, [userId], (err, data)=>{
        if(err){
                result(null);
        }else{
            if(data.length>0){
                let query2 = 'DELETE FROM cart WHERE user_id = ?';
                db.query(query2, [userId], (err, data)=>{
                    if(err){
                        result(null);
                    }else{
                        result('delete all products of user_id ' + userId + ' in cart success');
                    }
                })
            }else{
                result('you dont have product inside cart... ');
            }
        }
    })
}

Cart.decrease_amount = function({userId, productId}, result){
    let query1 = 'SELECT * FROM cart WHERE product_id = ? AND user_id = ?';

    db.query(query1, [productId, userId], (err, data)=>{
        if(err){
            result(err);
        }else{
            if(data.length>0){
                let quantity = data[0].quantity;
                if(quantity > 1){
                    let quantity1 = data[0].quantity - 1;
                    let query2 = 'UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id = ?';
                    db.query(query2, [quantity1, productId, userId], (err, data)=>{
                        if(err){
                            result(null);
                        }else{
                            result("decrease amount's product success!");
                        }
                    })
                }else{
                    let query3 = 'DELETE FROM cart WHERE product_id = ? AND user_id = ?';
                    db.query(query3, [productId, userId], (err, data)=>{
                        if(err){
                            result(null);
                        }else{
                            result('delete product of user_id ' + userId + ' in cart success');
                        }
                    })
                }
            }else{
                result('you dont have product')
            }

        }
    })
}

Cart.delete_product = function({userId, productId}, result){
    let query3 = 'DELETE FROM cart WHERE product_id = ? AND user_id = ?';
    db.query(query3, [productId, userId], (err, data)=>{
        if(err){
            result(null);
        }else{
            result('delete product of user_id ' + userId + ' in cart success');
        }
    })
}

Cart.getCart_user = function(id_user, result){
    let query1 = 'SELECT * FROM cart WHERE user_id = ?';
    db.query(query1, [id_user], (err, data)=>{
        if(err){
            result(null);
            console.log(err);
        }else{
            result(data);
        }
    })
}

module.exports = Cart