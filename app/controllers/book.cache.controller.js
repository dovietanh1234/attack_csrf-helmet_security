const { sign } = require('jsonwebtoken');
var Cache = require('../models/cache.model')


exports.handleCache = function(req, res){

    const id = req.params.id;
    Cache.handleCacheModel(id, function(result){
        if(result == null){
            return res.status(500).json({
                message: result.message
            })
        }else{
            return res.status(200).json({
                message: result
            })
        }
    })


}

exports.handleCookie = function(req, res){
    res.cookie('name', 'viet anh dep trai ahahahahah toi dep trai qua');

    res.cookie('age', '25', {sign: true});

    res.status(200).send('cookie is set')
}

exports.handleGetCookie = function(req, res){
    // lấy giá trị trong cookie ko ký tên name:
    let name = req.cookie.name

    // lấy giá trị cookie có ký tên age 
    let age = req.signedCookies.age

    if(name == null || name == undefined && age == null || age == undefined){
        return res.status(500).json({
            message: 'something wrong *_*'
        })
    }else{
        return res.status(200).send(`Name: ${name} --- Age: ${age}`);
    }
}

exports.handlePhanTrang = function(req, res){
  let currentPage = req.body.currentPage;

  Cache.handlePT({currentPage}, (data)=>{
        if(data == null){
            return res.status(400).json({
                message: 'error! please try again!'
            })
        }else{
            return res.status(200).json({
                message: data
            })
        }
  })

}

