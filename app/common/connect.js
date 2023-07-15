var mysql = require('mysql');

var connection =  mysql.createConnection({ // tạo 1 cái connection mới
    host: "localhost",
    user: "root",
    password: "",
    database: "demo_node_api"
}); 

// connect là 1 function -> nó sẽ trả về 1 cái function:
connection.connect( (err, connection)=>{
    if(err){
        console.log("connect to server fail *-*")
    }
} )

module.exports = connection // export để tái sử dụng ở những nơi khác nhau!