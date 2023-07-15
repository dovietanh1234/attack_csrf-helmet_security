const connect = require('../common/connect');

const path = require('path');

class homeSearchController{ // tao 1 class 
    index(req, res){
        res.sendFile(__dirname.replace('app\\controllers', '') + "/index.html");
    }
}

module.exports = new homeSearchController; 
//exports 1 class thi phai khoi tao 1 doi tuong