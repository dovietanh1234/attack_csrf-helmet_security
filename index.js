var express = require('express');
var app = express();
var cookiesParser = require('cookie-parser');

var path = require('path');
var logger = require('morgan');
const csrf = require('csurf');
const helmet = require("helmet")

// use helmet:
app.use(helmet());

// thiết lập thêm các middleware mới cho ứng dụng:
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

var csrfProtection = csrf({ cookie: true });

// cấu hình body-parser
var bodyParser = require('body-parser');
//var _AuthMiddleWare = require('./app/common/AuthorMiddleWare');
app.use(bodyParser.urlencoded({extended: false})) 
// day la 1 cai "middleware" -> apply cho toan bo router -> urlendcoded -> de co the giup
// co the bat duoc nhung data submit tu form len 
app.use(bodyParser.json()) // day la 1 cai middleware ap dung cho toan tuyen duong 
// khi ma chúng ta gửi request trên param dưới dạng "json()" 
// neu ta de cai .urlencoded() = true -> no se gap cac loi ve ky tu


app.use(cookiesParser()); // cookiesParser la 1 middleware! su dung de phan tich cu phap cookie

// xu ly: cho cac website khac access vao URL của node de lay du lieu: cau hinh lai tham so tren header...giup ta co the access duoc vao URL
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    next();
});



// các router mà POST PUT DELETE phải gửi theo mã token của csurf lên server mới có thể đi vào bên trong... headers: {'CSRF-Token': document.cookie.split('=')[1]...}
app.use((err, req, res, next)=>{
    if(err.code == 'EBADCSRFTOKEN'){
        res.status(403).json({
            error: 'Invalid or missing csrf token'
        });

    }else{
        next(err);
    }
})

app.get('/form', csrfProtection, (req, res)=>{
    res.send( { csrfToken: req.csrfToken() })
})


 require('./app/routers/book.router')(app, csrfProtection);
 require('./app/routers/book.search.router')(app)
//  require('./app/routers/home.search.router')(app)
// require('./app/routers/index')(app)
require('./app/routers/homerouter')(app); // import router -> chuyen tham so: app la thu vien express()
require('./app/routers/account.loggin.router')(app);

//app.use(_AuthMiddleWare.isAuthor); 
// sd middleware vao cac router o duoi | xu ly xem co dung la token cua client vao ko?
//".isAuthor" ta co the xu ly duoc di tiep hay o lai ... 

require('./app/routers/cart_order.router')(app);
require('./app/routers/user.router')(app);
require('./app/routers/payment.router')(app);

// cai method loggin no doi check authorization trong khi do! da loggin dau ma check 
// nhung routers nao can check loggin thi ta can cho xuong duoi 
// Tao 1 router chi danh cho loggin thoi 



app.listen(3005, ()=>{
    console.log("server listening on http://localhost:3005")
})

