var User = require("../models/users.model") 
//var jwt = require("../common/JWT")
var _App = require("../common/_App");
const jwt = require("jsonwebtoken");

var refreshtokenarr = []; // tac dung khi login no se .push() phan tu vao de luu tru du lieu

exports.list = function(req, res){
    User.get_all( (data)=>{
    res.send({
        book: data
    })
} )
}


exports.detail = function(req, res){
    User.getById(req.params.id, (data)=>{
        res.send({
            book: data
        })
    })
}

exports.add = function(req, res){
    // var data = {"id": 15, "name": "nha gia kim "}
    var data = req.body; // co the them du lieu trong postman qua method "post"
    User.create(data, function(response){
        res.send({result: response})
    })
}

exports.delete = function(req, res){
    // xóa phải xóa theo id -> lấy id
    var id = req.params.id;

    User.remove(id, function(){
    res.send({result: response})
})

}


exports.update = function(req, res){
    // var data = {"id": 15, "name": "nha gia kim "}

    var data = req.body; // co the them du lieu trong postman qua method "post"

    User.Update(data, function(response){
        res.send({result: response})
    })
}

//GENERATE ACCESS TOKEN:
function generateAccessToken(user1){
    return jwt.sign({
        id: user1.id,
        admin: user1.isAdmin
    }, _App.ACCESS_TOKEN, { 
        algorithm: "HS256",
        expiresIn: _App.TOKEN_TIME_LIFE, 
    });
}

//GENERATE REFRESH TOKEN:
function generateRefreshToken(user1){
    return jwt.sign({
        id: user1.id,
        admin: user1.admin
    }, _App.REFRESH_TOKEN, { 
        algorithm: "HS256",
        expiresIn: _App.REFRESH_TOKEN_TIME, 
    })
}

function generateRefreshTokenForAccess(user1){
    return jwt.sign({
        id: user1.id,
        admin: user1.admin
    }, _App.REFRESH_TOKEN, {
        algorithm: "HS256",
        expiresIn: _App.REFRESH_TOKEN_TIME,
    })
}

exports.loggin = function(req, res){
 var data = req.body; 
    User.check_login(data, async function(response){
        if(response){
           const {password, ...others} = response[0]; 
            const user1 = response[0];
            const user = {
                id: user1.id,
                admin: user1.isAdmin
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            refreshtokenarr.push(refreshToken);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            res.send({...others, accessToken});
        }else{
            res.send({result: null});
        }
    });
}

exports.refreshtk = async function(req, res){
    // 1. take refresh token from user
    // 2. nhiem vu cua no: tao 2 cai token moi -> tao 1 cai access token | tao 1 cai refresh token moi
const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
return res.send("fail *-* because you aren't authenticated ");}
if(!refreshtokenarr.includes(refreshToken)){
    return res.send({result: null});
}
    jwt.verify(refreshToken, _App.REFRESH_TOKEN, (err, user)=>{
        if(err){
            console.log(err);
            return res.send({result: null});
        }
    refreshtokenarr.filter((token)=> token !== refreshToken);
        const newaccesstoken1 = generateRefreshTokenForAccess(user);
        const newrefreshtoken = generateRefreshToken(user);
        refreshtokenarr.push(newrefreshtoken);
        res.cookie("refreshToken", newrefreshtoken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
        });
        res.send({accessToken: newaccesstoken1});
    })
}


exports.logout = async function(req, res){
// khi logout la token phai bien mat het:
    //refresh token bien mat dau tien (xoa cookie)
        res.clearCookie("refreshToken");
    // xoa access token trong redux store ben client

    // xoa refresh token con luu trong array = cach loc xoa thang da exist trong cookies
    refreshtokenarr = refreshtokenarr.filter(token => token !== req.cookies.refreshToken);
    res.send("Logged out Successfully!");
}
