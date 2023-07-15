module.exports = function(app){
    var bookController = require('../controllers/book.controller');
    var middlewarehadle = require('../common/AuthorMiddleWare');

     // app.get("/book/search", bookController.list_book) 
    app.get("/book/search/author_id", bookController.getAllauthor_id)// lay ra theo author_id
    //localhost:3005/book/search?author_id=
    app.get("/book/search/name", middlewarehadle.verifyToken, bookController.getAllname)// lay ra theo ten 
    app.get("/book/search/:id", bookController.detail) // lay ra theo id 
      app.get("/book/search_detail_1/:query", bookController.searchDe);
  app.get("/book/search", bookController.getBook1)  //lay ra all ca 2 bang
}