var express = require('express');
var router = express.Router();
var multer  = require('multer')
var md5=require("./md5")
var mysql=require("./mysql");
var xlsx=require("node-xlsx");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+"-"+file.originalname  )
    }
})

var upload = multer({ storage: storage })


/* GET home page. */
router.get('/signStu', function(req, res, next) {
    var name=req.query.name;
    var cid=req.query.cid;
    var pass=md5("123456");

    mysql.query(`insert into stu (name,pass,cid) values ('${name}','${pass}',${cid})`,function (err,result) {
        if(result.affectedRows>0){
            res.end("ok")
        }else{
            res.end("err");
        }
    })
});

router.post("/upload",upload.single("aa"),function (req,res) {



    var datas=(xlsx.parse(req.file.path))[0].data;

     mysql.query("select * from classes",function (err,result) {

         var json={};
         for(var i=0;i<result.length;i++){
             json[result[i].name]=result[i].id;
         }
         json={ 'w1710': '1', 'mui1710': '2', 'vui1710': '3' }

         var arr=[];
         for(var i=1;i<datas.length;i++){
            var arr1=[];
            arr1.push(datas[i][0]);
            arr1.push(md5("123456"));
            arr1.push(json[datas[i][1]]);
            arr.push(arr1);
         }

         mysql.query("insert into stu (name,pass,cid) values ?",[arr],function (err,result) {
             if(!err){
                 res.end("ok")
             }else{
                 res.end("err");
             }
         })

     })

    
})

router.get("/selectAll",function (req,res) {
    mysql.query("select * from stu",function (err,result) {
        if(err){
            res.end(JSON.stringify({message:"err"}))

        }else{

            res.end(Math.ceil(result.length/10).toString());
        }
    })
})

router.get("/select",function (req,res) {
    var start=req.query.page*10;
    
    mysql.query("select stu.*,classes.name as cname from stu,classes where stu.cid=classes.id limit "+start+",10",function (err,result) {
        if(err){
            res.end(JSON.stringify({message:"err"}))
        }else{
            console.log(result);
            res.end(JSON.stringify(result));
        }
    })
})

module.exports = router;
