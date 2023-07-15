 const jwt1 = require("jsonwebtoken");
var jwt = require("../common/JWT")
const _app = require("./_App");
var createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
// framework "jsdom" để làm gì trong nodejs  -> cài đặt nhiều tiêu chuẩn website (tiêu chuẩn DOM & HTML)
// "jsdom" dùng để phân tích xử lý HTML 

const window = new JSDOM('').window;
//tạo ra một đối tượng DOM từ một chuỗi html...
const DOMPurify = createDOMPurify(window);


let isAuthor = async function(req, res, next){
    var _token = req.headers.authorization;
    if(_token){
        try{
            var authData = await jwt.check(_token);
            req.auth = authData; 
            next();
        }catch(err){
            return res.send({data: "ma token khong match voi nhau"});
        }
    }else{
        return res.send({data: "ban chua gui kem ma token"});
    }
}

let verifyToken = async (req, res, next) => {
    const token1 = req.headers.token;
    if (token1) {
      try {
        const accesstoken1 = token1.split(" ")[1];
        jwt1.verify(accesstoken1, _app.ACCESS_TOKEN, (err, user) => {
          if (err) {
            return res.send("token invalid");
          }
          req.user = user;
          next();
        });
      } catch (e) {
        return res.send({ data: "your token is not accessible" });
      }
    } else {
      return res.send("you're not authenticated");
    }
  };

  let verifyTokenAndAdmin = async (req, res, next) => { 
    verifyToken(req, res, ()=>{
        if(req.user.id == req.params.id || req.user.admin == 1 ){
            // id cua token ma == voi id cua params gui len 
            next();
        }else{
            return res.send("you dont have the right to delete other people");
        }

    })

  }

  let sainitize_Book_update = async (req, res, next)=>{
    let body = req.body;
    try{

      // kiem tra xem gia tri update co gia tri ko hay undefined:
      if(body.name && body.image && body.author_id && body.id){
          // neu co gia tri -> lam sach gia tri dau vao:
          let name = DOMPurify.sanitize(body.name);
          let image = DOMPurify.sanitize(body.image);
          let author_id = DOMPurify.sanitize(body.author_id);
          let id = DOMPurify.sanitize(body.id);
          
          req.sanitizedInput = {name, image, author_id, id};
      }else{
        // nếu thiếu giá trị đầu vào, trả về lỗi 400 (bad request)
        return res.status(400).send('empty value... please enter value');
      }


    }catch(error){

        console.log(error);
        return res.status(500).send('internal server error');
    }

    next();

  }

  

module.exports = {
    isAuthor: isAuthor,
    verifyToken : verifyToken,
    verifyTokenAndAdmin: verifyTokenAndAdmin,
    sainitize_Book_update: sainitize_Book_update
}
