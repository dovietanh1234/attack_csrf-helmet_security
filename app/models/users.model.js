const db = require("../common/connect")
const bcrypt = require('bcryptjs');

const User = function(user){
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.isAdmin = user.isAdmin;
} // day la phan khoi tao thuoc tinh -> giong nhu constructor 

// tạo 1 đối tượng là để: chứa các dữ liệu & các methods liên quan: lưu trữ, truy xuất, xử lý dữ liệu ...


User.get_all = function(result){ // get_all là 1 biến static 
    // var data =[
    //     {"id": 1, "name": "psychology impact in life"},
    //     {"id": 2, "name": "the love"},
    //     {"id": 3, "name": "the animals of earth"},
    // ];

    db.query("SELECT * FROM users", (err, book)=>{ // tham so thu 2: tham so gui du lieu ve
        if(err || book.length == 0){
            result(null)
        }else{
             result(book)
        }
    });
    // khi goi get_all -> ta phai truyen vao tham so la: 1 function -> cai function do thi se nhan duoc 1 doi so la: data  
}

User.getById = function(id, result){ 
// vi la phai chuyen doi du lieu -> ne tao them 1 tham so result cho func getByid
    db.query("SELECT * FROM users WHERE id = ?", id,(err, book)=>{ // tham so thu 2: tham so gui du lieu ve
        if(err || book.length == 0){
            result(null);
        }else{
            result(book[0]);
        }
    })
}

User.create = async function(data, result){
    
   try{
    // hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);
    //create object add database
    const user = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        isAdmin: data.isAdmin
        // roll: Admin
    };

    db.query("INSERT INTO users SET ?", user, (err, book)=>{
        if(err){
            result(null);
        }else{
            result({id: book.insertId, ...User});
        }
    })

   }catch(e){
        result(e);
        
   }

}

User.remove = function(id, result){
    // xu ly du lieu:

    db.query("DELETE FROM users WHERE id = ?", id, (err, book)=>{
        if(err){
            result(null);
        }else{
            result("oke delete users id: " + id + "thành công");//result se nhan vao 1 doi tuong 
    
        }
       })
}

User.Update = function(data, result){
    db.query("UPDATE users SET name=?,email=?,password_id=? WHERE id=?", [data.name, data.email, data.password, b.id], (err, book)=>{
        // data.name lấy trên request
        if(err){
            result(null);
        }else{
            result(data);
        }
       })
}

// get theo email:
User.check_login = function(data, result) {
    try{
       db.query("SELECT * FROM users WHERE email = ?", [data.email], async (err, user)=>{
            if(err || user.length == 0){
                result(null);
            }else{
                const isMatch = await bcrypt.compare(data.password, user[0].password)
                if(isMatch){
                   return result(user);
                }else{
                   return result(null);
                }
            }
        })
    }catch(e){
        console.log(e);
        result(e);
    }
  };

module.exports = User
