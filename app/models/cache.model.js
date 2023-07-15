const db = require('../common/connect');
const axios = require('axios');
const NodeCache = require('node-cache');

// tạo đối tượng cache có thời gian làm mới quy đinh để nó luôn trả về dữ liệu mới nhất cho ta
const cache = new NodeCache({ stdTTL: 600 });

const Cache = function(book){
    this.id = book.id;
    this.name = book.name;
    this.image = book.image;
    this.author_id = book.author_id;
}

var countAllProduct = function(){
    return Promise( (resolve, reject)=>{

        let sql = 'SELECT COUNT(*) as SUM FROM books';

        db.query(sql, (err, data)=>{
            if(err){
                reject(err);
            }
            console.log(data);
            resolve(data);
        })

    })
}


Cache.handleCacheModel = async function(id, result){
    // check xem trong đối tượng cache có đối tượng là id chưa?
    const cacheData = cache.get(id);

    // nếu có rồi trả về kết quả từ cache:
    if(cacheData){
        result(cacheData);
    }else{
        // gọi API bên ngoài để lấy kết quả:
        try{
            const response = await axios.get(
                `http://localhost:3005/book/detail/${id}`
            );

            const data = response.data;
            console.log('data retrieve from API');

            // save result in cache key-id:
            cache.set(id, data);

            //return result from API:
            result(data);

        }catch(error){
            result(null);
        }
    }
}

Cache.handlePT = async function({currentPage}, result){

let limit = 10;
let totalPages = 1;
try{
    let allProduct = await countAllProduct();

     totalPages = Math.ceil(allProduct/limit);   
}catch(error){
    return result(null);
}

console.log(totalPages);

 if(currentPage == null || currentPage == undefined){
    return result(null);
 }

 if(currentPage<=0){
    currentPage = 1;
 }

if(currentPage>totalPages){
    currentPage = totalPages;
}

let start = (currentPage-1) * limit;

let sql = `SELECT * FROM books LIMIT ${start}, ${limit}`;
db.query(sql, [start, limit], (error, data)=>{
    if(error){
        return result(null);
    }else{
           return result(data);
    }
})

}




module.exports = Cache;