module.exports = function(app){
const homeSearchController = require("../controllers/home.search.controller");

app.get("/", homeSearchController.index);

}


