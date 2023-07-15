var Book = require("../models/book.model") 

exports.list_book = function(req, res){
Book.get_all( (data)=>{
    res.send({
        book: data
    })
} )
}

exports.getAllauthor_id = function(req, res){
    Book.getByAuthor_id_hdl((data)=>{
    res.send({
        book: data
    })
})
}

exports.getAllname = function(req, res){
    Book.getByName((data)=>{
        res.send({
            book: data
        })
    })
}

exports.detail = function(req, res){
    Book.getById(req.params.id, (data)=>{
        res.send({
            book: data
        })
    })
}

// req.params.key la lay ra tat ca nhung thang nao ta viet len url

exports.getBook1 = function(req, res){
    const {name, author_id} = req.query
    //console.log('name:', name);
   // console.log('author_id:', author_id);
    Book.getElement({name, author_id}, (data)=>{
       // console.log('data:', data);
        res.send({
            book: data
        })
    })
}

exports.searchDe = function(req, res){
    const query1 = req.query.q;
    // http://localhost:3000/search?q=nodejs
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    Book.Search_detail(query1, limit, offset, (data)=>{
        res.send({
            book: data
        })
        
    })
}


exports.add_book = function(req, res){
    // var data = {"id": 15, "name": "nha gia kim "}

    var data = req.body; // co the them du lieu trong postman qua method "post"

    Book.create(data, function(response){
        res.send({result: response})
    })
}

exports.delete_book = function(req, res){
    // xóa phải xóa theo id -> lấy id
    var id = req.params.id;

Book.remove(id, function(){
    res.send({result: response})
})

}


exports.book_update = function(req, res){
    // var data = {"id": 15, "name": "nha gia kim "}

    var data = req.sanitizedInput; // co the them du lieu trong postman qua method "post"
    
    // req.body -> lay ve 1 object du lieu! ta da dien vao postman gui len! ex: {name, age, id, sdt...}

    Book.Update(data, function(response){
        if(response == null){
            return res.status(500).json({
                message: 'error'
            })
        }
        res.status(203).json({
            message: response
        })
    })
}
