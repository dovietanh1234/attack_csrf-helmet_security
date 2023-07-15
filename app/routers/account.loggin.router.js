module.exports = function(app){
    var usersController = require('../controllers/users.controller');
    var Authorization = require('../common/AuthorMiddleWare');

    app.post("/account/login", usersController.loggin) // loggin
    app.post("/account/add", usersController.add); // dang ky
    app.post("/account/refresh", usersController.refreshtk);// refresh
    app.post("/account/logout", Authorization.verifyToken, usersController.logout)
}
// cho phep client dang nhap va dang ky 
