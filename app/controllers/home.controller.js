exports.about = function(req, res){

    res.send("this is about us we are a team have 5 members leader is Dung");
    //res.sendFile(__dirname.replace('app\\controllers', '') + "/index.html") 
    // send file ve cho client 
   
    //__dirname --> duong dan tuyet doi dan vao file cua us + sendFile( "./doi so la 1 file" ) -> co the gui 1 file len UI  
 //.send("") -> show doi so: text len UI |
}

exports.json = function(res, req){
    var data = [
        {"id": 1, "name": "demo json string "},
        {"id": 2, "name": "demo json string 1"},
        {"id": 3, "name": "demo json string 2"},
    ];

    res.send({book: data})
}