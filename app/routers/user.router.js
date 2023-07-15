module.exports = function(app){
    var usersController = require('../controllers/users.controller');
    var middlewarehadle = require('../common/AuthorMiddleWare');

    app.get("/users/list", usersController.list)

    app.get("/users/detail/:id", usersController.detail)

    app.post("/users/add", usersController.add)

    app.delete("/users/delete/:id", middlewarehadle.verifyTokenAndAdmin, usersController.delete)

    app.put("/users/update", usersController.update)

}