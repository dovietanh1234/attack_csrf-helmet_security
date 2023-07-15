// var express = require('express');
// var router = express.Router();

// var bookController = require('../controllers/book.controller');

// router.get("/book/list", bookController.list_book)


// router.get("/book/detail/:id", bookController.detail)


module.exports = function(app, csrfProtection){
    var bookController = require('../controllers/book.controller');
    var bookCacheController = require('../controllers/book.cache.controller');
    var middleware = require('../common/AuthorMiddleWare');

    app.get("/book/list", bookController.list_book)

    app.get("/book/detail/:id", bookController.detail)

    app.post("/book/add", csrfProtection,bookController.add_book)

    app.delete("/book/delete/:id", csrfProtection,bookController.delete_book)

    app.put("/book/update", csrfProtection, middleware.sainitize_Book_update ,bookController.book_update) // gan middleware update 

    // cache 
    app.get("/book/cache/:id", bookCacheController.handleCache)

    // cookie
    app.get('/set-cookie', bookCacheController.handleCookie)

    app.get('/get-cookie', bookCacheController.handleGetCookie)

    // phân trang 
    app.get('/phantrang', bookCacheController.handlePhanTrang);

}

