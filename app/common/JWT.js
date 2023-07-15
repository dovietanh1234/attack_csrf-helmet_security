const jwt = require("jsonwebtoken");
const _App = require("./_App");

let make = function(user){ // user co the co kieu du lieu theo 1 model nao do!
    return new Promise( (resolve, reject)=>{
    jwt.sign({data: user}, _App.ACCESS_TOKEN, { // method sign() co 4 doi so
        algorithm: "HS256", // cách mã hóa
        expiresIn: _App.TOKEN_TIME_LIFE, 
    },
        function(err, _token){  // tham so thu 4 
            // neu nhu method .sign() thanh cong se tra ve: _token
            // neu loi tra ve loi!
             if(err){
                return reject(err);
            } 
            return resolve(_token)
        }
    ); // tu thu vien jwt goi den method sign()
 //  parameter1-> object -> trong object:
 // co key la: "data" | value: "user" la: -> du lieu se gui ben ngoai vao!

 // parameter2 -> la 1 doan ma dac biet! moi ung dung se co doan ma rieng! 
 //parameter3 -> thoi gian
 //=> 2 tham so 2 va 3: ta nen cau hinh o 1 noi ta it khi dong toi-> khi can ms vao
    } )
};


//METHOD: CHECK DATA
let check = function(token){ // nen khai bao theo kieu let vi no thay doi lien tuc

return new Promise( (resolve, reject)=>{
    jwt.verify(token, _App.ACCESS_TOKEN, function(err, data){
        // neu "verify()" thanh cong -> guu du lieu da dc decode tro lai
        if(err){
            return reject(err);
        }else{
            return resolve(data);
        }
    }); // ts1: token -> sau khi client nhan duoc doan ma cua token
    // ta se dua no vao day | ts2: can 1 cai access -> token access | ts3: cb
} )
}

module.exports = {
    make: make,
    check:check,
}
//PHAN CREATE 