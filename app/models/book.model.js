const db = require("../common/connect")

const Book = function(book){
    this.id = book.id;
    this.name = book.name;
    this.image = book.image;
    this.author_id = book.author_id;
} // day la phan khoi tao thuoc tinh -> giong nhu constructor 

// tạo 1 đối tượng là để: chứa các dữ liệu & các methods liên quan: lưu trữ, truy xuất, xử lý dữ liệu ...


Book.get_all = function(result){ // get_all là 1 biến static 
    // var data =[
    //     {"id": 1, "name": "psychology impact in life"},
    //     {"id": 2, "name": "the love"},
    //     {"id": 3, "name": "the animals of earth"},
    // ];

    db.query("SELECT * FROM book", (err, book)=>{ // tham so thu 2: tham so gui du lieu ve
        if(err || book.length == 0){
            result(null)
        }else{
             result(book)
        }
    });
    // khi goi get_all -> ta phai truyen vao tham so la: 1 function -> cai function do thi se nhan duoc 1 doi so la: data  
}

Book.getByAuthor_id_hdl = function(result){
    db.query("SELECT author_id FROM book", (err, book)=>{
        if(err || book.length == 0){
            result(null);
        }else{
            result(book);
        }
    })
}

Book.getByName = function(result){
    db.query("SELECT name FROM book", (err, book)=>{
        if(err || book.length == 0){
            result(null);
        }else{
            result(book)
        }
    })
}

Book.getById = function(id, result){ 
// vi la phai chuyen doi du lieu -> ne tao them 1 tham so result cho func getByid
    db.query("SELECT * FROM book WHERE id = ?", id,(err, book)=>{ // tham so thu 2: tham so gui du lieu ve
        if(err || book.length == 0){
            result(null);
        }else{
            result(book[0]);
        }
    })
}

//localhost:3005/book/search?author_id= ...
//localhost:3005/book/search?name= ...
Book.getElement = function({name, author_id}, result){
    let sql = `SELECT *, book.name AS bn FROM book, author WHERE author.id = book.author_id `;
    if (name) {
      let nameFilter = name.join("','");
      sql += `AND author.name IN ('${nameFilter}') `;
    }
    if (author_id) {
      let author_id_Filter = author_id.join("','");
      sql += `AND book.author_id IN ('${author_id_Filter}') `;
    }
db.query(sql, (err, book)=>{
    // if(err || book.length == 0){
    //     result(null);
    // }else{
    //     result(book)
    // }
    if(err){
        console.log(err);
        result(null);
    }else{
        result(book);
    }
})
}

 // http://localhost:3000/search?q=nodejs
Book.Search_detail = function(query1, limit, offset, data){
    let sql = `
    SELECT *
    FROM book
    WHERE
      name LIKE '%${query1}%' OR
      author_id LIKE '%${query1}%'
    LIMIT ${limit}
    OFFSET ${offset}
  `;
db.query(sql, (err, book)=>{
    if(err){
        console.log(err);
        data(null);
        console.log(err);
    }else{
        data(book);
        console.log(book);
    }
})
  
}


Book.create = function(data, result){
   db.query("INSERT INTO book SET ?", data, (err, book)=>{
    if(err){
        result(null);
    }else{
        result({id: book.insertId, ...data});//result se nhan vao 1 doi tuong 
        // values cua doi tuong la: 1. id cua ket qua tra ve vao bien thu 1
        //                          2. la du lieu
        
        //giải thích: data chuyền ở ngoài ko biết id(id tự tăng)
        //Insert xong! auto trả về cái book cho ta -> ben trong book có id
        // lúc này ta sẽ gán cái id vào cho data bằng cách "..." 
        // dấu "..." sẽ tự lấy cái id của "book.insertId"
        //sau do ta tra ve ca cai newData luon! co id ben trong
    }
   })

}

Book.remove = function(id, result){
    // xu ly du lieu:

    db.query("DELETE FROM book WHERE id = ?", id, (err, book)=>{
        if(err){
            result(null);
        }else{
            result("oke delete book id: " + id + "thành công");//result se nhan vao 1 doi tuong 
    
        }
       })

}

Book.Update = function(data, result){
    console.log(data);
    db.query("UPDATE `book` SET `name`=?,`image`=?,`author_id`=? WHERE id=?", [data.name, data.image, data.author_id, data.id], (err, book)=>{
        // data.name lấy trên request
        if(err){
            result(null);
        }else{
            result('update data success');
        }
       })
}

module.exports = Book
