// var express = require('express');
// var router = express.Router();

// var homeController = require('../controllers/home.controller');

// router.get("/about", homeController.about)


// router.get("/info", homeController.info)

// router.get("/json", homeController.json)

// module.exports = router;

module.exports = function(app){
    var homeController = require('../controllers/home.controller');
    var jwt = require("../common/JWT");

app.get("/about", homeController.about)

app.get("/json", function(req, res){
res.send("render file json ")
})

app.get("/token", async function(req, res){
    //đáng nhẽ cái router data "user" sẽ lấy từ request.body nhưng tạm thời 
    // ta sẽ fix cứng bằng 1 biến ở dưới
    var user = {
        name: "Admin",
        email:"admin@gmail.com"
    };

    const _token = await jwt.make(user);
    res.send({token: _token});

})

app.get("/checktoken", async function(req, res){
   try{
        //cai token ta se lay theo request -> bay h ta use copy fix cung truoc
        var _token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Im5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIn0sImlhdCI6MTY4MDI3OTEyNiwiZXhwIjoxNjgwMjgyNzI2fQ.aYHGL_U3pSph2vfTKuI0bjaiWf42-1W2OvyHRbQYdlg";
        const data = await jwt.check(_token); // data lay duoc sau khi "check()"
        res.send({data: data}); // check thanh cong tra ve data
   }catch(err){
    res.send({data: "lam meo co token ma dung"});
   }
 
    //b2: de tranh bi sap server vi loi -> su dung trong try catch
})

}