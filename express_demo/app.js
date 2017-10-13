var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
var managername="李大铭";
var querystring = require('querystring');
/*
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./private.pem', 'utf8');
var certificate = fs.readFileSync('./file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var PORT = 18080;
var SSLPORT = 18081;

httpServer.listen(PORT, function() {
    console.log('HTTP Server is running on: http://localhost:%s', PORT);
});
httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// Welcome
app.post('/', function(req, res) {
    if(req.protocol === 'https') {
        res.status(200).send('Welcome to Safety Land!');
    }
    else {
        res.status(200).send('Welcome!');
    }
});
*/
var https = require("https");
var iconv = require("iconv-lite");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);




// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('./db/DBConfig');
var userSQL = require('./db/Usersql');
var managerSQL = require('./db/Managersql');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool(dbConfig.mysql);
var advertiseId=5;

app.post('/', function(req, res, next) {  
    
	var fs=require('fs');
 	

	//判断是不是管理员
	if(req.body.management=='123456')
	{
		console.log("管理员登陆");
		pool.getConnection(function(err, connection) {
                connection.query(managerSQL.getUserAll,function(err, result) {
                        if(result) {
                          res.send(result);res.end();
                        }
                        else
                        {
                         res.send([]);res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
	}
	else if(req.body.name){//判断是发公告还是注册
	// 建立连接 注册用户
		pool.getConnection(function(err, connection) {
	 	connection.query(userSQL.Userinsert, [req.body.PhoneNumber,req.body.name,req.body.address,1,req.body.openid], function(err, result) {
        		if(result) {
			  res.send(JSON.stringify({ status:"success" }));res.end();
        		}
			else
			{
			 res.send(JSON.stringify({ status:"fail" }));res.end();
			}
     	// 释放连接  
      			connection.release();
         });
	});
	    
	}else if(req.body.message=='123456'){//判断发公告还是返回公告
		
			//返回公告的历史数据
		console.log("返回公告的历史数据");
		pool.getConnection(function(err, connection) {
                connection.query(managerSQL.queryAll,function(err, result) {
                        if(result) {
                         res.send(result);res.end();
                        }
			else
			{res.send([]);res.end();}
        // 释放连接  
                        connection.release();
         });
        });

	}else{
		console.log("发公告");
		console.log(req.body);
		var a1=managername;
		var a2=req.body.time;
		var a3=req.body.title;
		var a4=req.body.text;
		var a5=req.body.touxiang;
		pool.getConnection(function(err, connection) {
                connection.query(managerSQL.Adinsert, [a1,a2,a3,a4,a5], function(err, result) {
			
                        if(result){
                         res.send(JSON.stringify({ status:"success" }));res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
	
	}	
}); 

app.post('/exam/passchange', function(req, res){
	console.log("我是passchange，准备修改以下内容");
    	console.log(req.body.changeData);
	for(let i=0; i<req.body.changeData.length;i++)
	{
		pool.getConnection(function(err, connection) {
                connection.query(managerSQL.Userupdate, [req.body.changeData[i].phone,req.body.changeData[i].address,req.body.changeData[i].name], function(err, result) {
                        if(result) {
                         console.log(result);
                         res.send(JSON.stringify({ status:"changedata_success" }));res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
       });
	}
}); 
app.post('/exam/blackchange', function(req, res){
	
	console.log("我是blackchange，准备修改以下内容");
	console.log(req.body);
    console.log(req.body.changeData);
    console.log(req.body.changeData);
        for(let i=0; i<req.body.changeData.length;i++)
        {

                pool.getConnection(function(err, connection) {
                connection.query(managerSQL.Userdown, [req.body.changeData[i].phone,req.body.changeData[i].address,req.body.changeData[i].name], function(err, result) {
                        console.log(result);
                        if(result) {
                         console.log(result);
                         res.send(JSON.stringify({ status:"changedata_success" }));res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
       });      
        }
}); 
app.post('/check', function(req, res){
	
	console.log("我是check，准备检验以下openid");
	console.log(req.body);
	// 查找用户
	 if(req.body.openid!=null)
	{
                pool.getConnection(function(err, connection) {
                connection.query(userSQL.selectByOpenid, [req.body.openid], function(err, result) {
		console.log(JSON.stringify(result));
			if(JSON.stringify(result)!='[]')
			{
                        if(result[0].power==2) {
                         res.send(JSON.stringify({ status:"success" }));res.end();
                        }
                        else if(result[0].power==1||result.RowDataPacket.power==0)
                        {
			
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
			else{
			res.send(JSON.stringify({ status:"notfind" }));res.end();
				}
			}
		else{
                        res.send(JSON.stringify({ status:"notfind" }));res.end();
                                }

			
        // 释放连接  
                        connection.release();
         });
        });
	}
	 else{
                        res.send(JSON.stringify({ status:"notfind" }));res.end();
                                }
					
	});
	

app.post('/titledelete', function(req, res){
	
	console.log("我是deletetitle，准备删除以下文章");
	console.log(req.body.changeData[0]);
	
	for(let i=0;i<req.body.changeData.length;++i){
	pool.getConnection(function(err, connection) {
        connection.query(managerSQL.Titledelete, [req.body.changeData[i].title,req.body.changeData[i].time], function(err, result) {
                        if(result) {
                          res.send(JSON.stringify({ status:"deletetitle_success" }));res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
    }


}); 
app.post('/login',function(req,res1){
        var js_code;
        var encryptedData;
	var openid;
        if(req.body.code){
        console.log("我是login，拿到的code是：");
        console.log(req.body.code);
        js_code=JSON.stringify(req.body.code);
        }
        if(req.body.encryptedData){
        console.log("我是login，拿到的encryptedData是");
        console.log(req.body.encryptedData);
        encryptedData=JSON.stringify(req.body.encryptedData);
        }

//获取openid
        console.log("我是login，拿到的openid是");
    var appid='wx00ac6a015fefe8df'; 
    var secret='f86859b69d22296b5759d54748761ae9';	
    var openid;
    var url="https://api.weixin.qq.com/sns/oauth2/access_token?appid="+appid+"&secret="+secret+"&code="+req.body.code+"&grant_type=authorization_code";
    https.get(url, function (res) {  
        var datas = [];  
        var size = 0;  
        res.on('data', function (data) {  
            datas.push(data);  
            size += data.length;  
        //process.stdout.write(data);  
        });  
        res.on("end", function () {  
            var buff = Buffer.concat(datas, size);  
            var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring
	    openid=JSON.parse(result).openid;
	    
   	    console.log(openid);
	   res1.send(result);res1.end();
        });
    }).on("error", function (err) {  
        Logger.error(err.stack)  
        callback.apply(null);  
    }); 
});
//显示评论
app.post('/comment/load',function(req,res){
        console.log("comment，拿到的time是");
        console.log(req.body.time);
	console.log("comment，拿到的title是");
	console.log(req.body.title);
	pool.getConnection(function(err, connection) {
        connection.query(userSQL.getCommentByAdvertiseId, [req.body.title,req.body.time], function(err, result) {
                        if(result) {
			res.send(result);
			res.end;
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
       

});
//发表评论
app.post('/comment/write',function(req,res){
		console.log("发表评论");
        pool.getConnection(function(err, connection) {
        connection.query(userSQL.Commentinsert, [req.body.title,req.body.time,req.body.submit_time,req.body.text,req.body.author], function(err, result) {
                        if(result) {
			   console.log(advertiseId);
                           res.send(JSON.stringify({ status:"success" }));//给客户端返回一个json格式的数据  
                	res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
      

});
app.post('/openid',function(req,res){
		console.log("返回openid");
	pool.getConnection(function(err, connection) {
        connection.query(managerSQL.getOpenidbyPower, function(err, result) {
                        if(result) {
                           console.log(result);
			   res.send(result);
                           res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
});
//添加投票
/*
app.post('/vote/create',function(req,res){
                console.log("添加投票");
		console.log(req.body);
                var a1=req.body.date;
                var a2=req.body.time;
                var a3=req.body.voteType;
                var a4=req.body.voteTitle;
                var a5=req.body.voteText;
		var a6=req.body.files;
		var a7=JSON.stringify(req.body.optionList);
                pool.getConnection(function(err, connection) {
                connection.query(managerSQL.Voteinsert, [a1,a2,a3,a4,a5,a6,a7], function(err, result) {

                        if(result){
                         res.send(JSON.stringify({ status:"success" }));res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });

});
//返回投票内容
app.post('/vote/index',function(req,res){
        pool.getConnection(function(err, connection) {
        connection.query(managerSQL.getVoteAll, function(err, result) {
                        if(result) {
                           console.log(result);
                           res.send(result);
                           res.end();
                        }
                        else
                        {
                         res.send([]);res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });

})
//返回选项
app.post('/vote/detail',function(req,res){
              console.log("返回投票里面的选项数据");
	pool.getConnection(function(err, connection) {
        connection.query(managerSQL.getVoteBytitileAndtime, [req.body.voteDate,req.body.voteTitle], function(err, result) {
                        if(result) {
		         //   var a= eval('('+result+')');     
                         //  console.log(a);
			   var str=JSON.stringify(result);
			   console.log(str);
			   console.log(result);
			   res.contentType('json');
                           res.send(result);
                           res.end();
                        }
                        else
                        {
                         res.send([]);res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });

})
//返回人数
app.post('/people',function(req,res){
                var fs=require('fs');
              console.log("返回人数");
              var content=fs.readFileSync('./output.json','utf-8');
              res.contentType('json');//返回的数据类型 
              //将string变成字符串数组，再将字符串数组中的元素变成json对象！
              var array=eval('([' + content + '])');
	      var count=0;
              for(let i=0;i<array.length;i++)
                {
                        if(array[i].power=="2")
                        {
                             count++;
                        }
                }
              res.send(JSON.stringify({ status:count }));
              res.end();
})
//修改投票
app.post('/vote/change', function(req, res){

        console.log("准备修改以下投票");
        console.log(req.body);
	console.log(req.body.option);
        var fs=require('fs');
        var content=fs.readFileSync('./vote.json','utf-8');
        var array=eval('([' + content + '])');//将所有文章转成json数组
                        for(let i=0;i<array.length;i++)
                        {
                         if(array[i].voteTitle==req.body.voteTitle&&array[i].date==req.body.voteDate)
			{
				console.log("找到了");
				for(let j=0;j<req.body.option.length;j++)
				{
				 for(let k=0;k<array[i].optionList.length;k++)
					{
						if(req.body.option[j]==array[i].optionList[k].value)
							{
						console.log("票数加1");
						array[i].optionList[k].num=(Number(array[i].optionList[k].num)+1).toString();
						console.log(array[i].optionList[k].num);	
						break;
							}
					}
				
			       }
				//console.log(array);
				break;
			}
                }
	
 	var temp_str=JSON.stringify(array);           
	var k=temp_str.substring(1,temp_str.length-1);
	console.log(k);
        //修改完，重新写入

        console.log("执行修改");
        fs.writeFileSync("./vote.json",k);
        res.contentType('json');
        res.send(JSON.stringify({ status:"success" }));
        res.end()

});
*/

//添加投票
app.post('/vote/create',function(req,res){
                console.log("添加投票");
                var fs=require('fs');
                var content=fs.readFileSync('./vote.json','utf-8');
                //console.log(content);
                if(content!="")
                {
                var str=","+JSON.stringify(req.body);
                fs.appendFile('./vote.json',str, function () {});
                //fs.appendFile('./advertise.json',JSON.stringify(req.body), function () {});
                }
                else
                {
                        fs.appendFile('./vote.json',JSON.stringify(req.body), function () {});
                        console.log("为空");
                }
                //fs.appendFile('./output.json',JSON.stringify(req.body), function () {});
                res.contentType('json');//返回的数据类型
                res.send(JSON.stringify({ status:"success" }));//给客户端返回一个json格式的数据
                res.end();

});
//返回投票内容
app.post('/vote/index',function(req,res){
                var fs=require('fs');
              console.log("返回投票数据");
              var content=fs.readFileSync('./vote.json','utf-8');
              res.contentType('json');//返回的数据类型
              //将string变成字符串数组，再将字符串数组中的元素变成json对象！
              var array=eval('([' + content + '])');
              res.send(array);
              res.end();

})
//返回选项
app.post('/vote/detail',function(req,res){
                var fs=require('fs');
              console.log("返回投票里面的选项数据");
              var content=fs.readFileSync('./vote.json','utf-8');
              res.contentType('json');//返回的数据类型
              //将string变成字符串数组，再将字符串数组中的元素变成json对象！
              var array=eval('([' + content + '])');
              var str_option;
                console.log(req.body.voteDate);
                console.log(req.body.voteTitle);
              for(let i=0;i<array.length;i++)
                {
                        if(array[i].date==req.body.voteDate&&array[i].voteTitle==req.body.voteTitle)
                        {
                     console.log("找到了");
                                str_option=array[i].optionList;
                                break;
                        }
                }
              res.send(str_option);
              res.end();

})
//返回人数
app.post('/people',function(req,res){
                var fs=require('fs');
              console.log("返回人数");
              var content=fs.readFileSync('./output.json','utf-8');
              res.contentType('json');//返回的数据类型
              //将string变成字符串数组，再将字符串数组中的元素变成json对象！
              var array=eval('([' + content + '])');
              var count=0;
              for(let i=0;i<array.length;i++)
                {
                        if(array[i].power=="2")
                        {
                             count++;
                        }
                }


	pool.getConnection(function(err, connection) {
        connection.query(managerSQL.getNumbypower,function(err, result) {
                        if(result) {
			console.log(result[0]);
                        res.send(JSON.stringify(result[0]));
              		res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
})
//修改投票
app.post('/vote/change', function(req, res){

        console.log("准备修改以下投票");
        console.log(req.body);
        console.log(req.body.option);
        var fs=require('fs');
        var content=fs.readFileSync('./vote.json','utf-8');
        var array=eval('([' + content + '])');//将所有文章转成json数组
                        for(let i=0;i<array.length;i++)
                        {
                         if(array[i].voteTitle==req.body.voteTitle&&array[i].date==req.body.voteDate)
                        {
                                console.log("找到了");
                                for(let j=0;j<req.body.option.length;j++)
                                {
                                 for(let k=0;k<array[i].optionList.length;k++)
                                        {
                                                if(req.body.option[j]==array[i].optionList[k].value)
            {
                                                console.log("票数加1");
                                                array[i].optionList[k].num=(Number(array[i].optionList[k].num)+1).toString();
                                                console.log(array[i].optionList[k].num);
                                                break;
                                                        }
                                        }

                               }
                                //console.log(array);
                                break;
                        }
                }

        var temp_str=JSON.stringify(array);
        var k=temp_str.substring(1,temp_str.length-1);
        console.log(k);
        //修改完，重新写入

        console.log("执行修改");
        fs.writeFileSync("./vote.json",k);
        res.contentType('json');
        res.send(JSON.stringify({ status:"success" }));
        res.end()

});
app.post('/share/advertise',function(req,res){
                console.log(req.body);
  		console.log("开始发通告给所有业主");
		
        const request = require('sync-request');
	var appid='wx00ac6a015fefe8df'; 
    var secret='f86859b69d22296b5759d54748761ae9';	
	var access_token=null;
	var url="https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+secret;
    https.get(url, function (res2) {  
        res2.on('data', function (data) {  
          console.log("token data "+data);
		  access_token = JSON.parse(data).access_token;
		  
		  console.log("access_token "+ access_token);	
			pool.getConnection(function(err, connection) {
				connection.query(managerSQL.getOpenidbyPower,
				function(err, result) {
					if (result) {
						console.log(result);
						for (let i = 0; i < result.length; i++) {
							  // 第二步，请求发送模板消息
							  console.log("openid: " + result[i].openid);
							  console.log("form_id: "+ req.body.fId);
							  var res_sync=request('POST','https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + access_token,
							  {
								json: {
								  touser:result[i].openid,
								  template_id:"EWmCaVDOgB_vMlmZDvomNxKAgTXAxoAL4tM8QCaPE1g",
								  form_id: result[i].formId,
								  page:'/pages/message/message',
								  data: {
									"keyword1": {
												"value": req.body.keyword1,
												"color": "#173177"
												},
												"keyword2": {
												"value": req.body.keyword2,
												"color": "#173177"
												},
												"keyword3": {
												"value": req.body.keyword3,
												"color": "#173177"
												}
									}
								  }
								}
							  
							  );
						
							  var user = JSON.parse(res_sync.getBody('utf8'));
							  console.log(user);
							};
						
					} //else {
						//res.send(JSON.stringify({
						//	status: "fail"
						//}));
						//res.end();
					//}
					// 释放连接  
					connection.release();
				});
			});
		  
        //process.stdout.write(data);  
        });  
       
    }).on("error", function (err) {  
      console.log(err);  
    });
});

app.post('/share/vote',
function(req, res) {
    console.log(req.body);
    console.log("开始发投票给所有业主");
	// 引入request库，用于网络请求交互
    const request = require('sync-request');
	var appid='wx00ac6a015fefe8df'; 
    var secret='f86859b69d22296b5759d54748761ae9';	
	var access_token=null;
	var url="https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+secret;
    https.get(url, function (res2) {  
        res2.on('data', function (data) {  
          console.log("token data "+data);
		  access_token = JSON.parse(data).access_token;
		  
		  console.log("access_token "+ access_token);
		 /* //获取帐号下的模版
		  console.log("获取模版列表：--------------------")
		  var headerData_temp = {
							  host: 'api.weixin.qq.com',
							  port:443,
							  path: '/cgi-bin/wxopen/template/list?access_token='+access_token,
							  method: 'POST',
							 // headers: {
								  //'Content-Type': 'application/json; encoding=utf-8',
								  //'Content-Length': JSON.stringify(postData).length
							//		 }
							};
							var postData_temp = {
								"offset":0,
								"count":1
							}

		 var reqHttps1= https.request(headerData_temp,(res3) => {
							  console.log(`STATUS: ${res1.statusCode}`);
							  console.log(`HEADERS: ${JSON.stringify(res1.headers)}`);
							  res3.setEncoding('utf8');
							  // res1.on('data', (chunk) => {
							  //	console.log(`BODY: ${chunk}`);
							  // });
							  res3.on('data', function (list) {  
								console.log("list: "+list);
							  })
							  res3.on('end', () => {
								console.log('No more data in response.');
							  });
							});
							reqHttps1.on('error', (e) => {
							  console.log(`problem with request: ${e.message}`);
							});					
							reqHttps1.write(JSON.stringify(postData_temp));
							reqHttps1.end();	
							
				console.log("---------------------------")	*/		
			pool.getConnection(function(err, connection) {
				connection.query(managerSQL.getOpenidbyPower,
				function(err, result) {
					if (result) {
						console.log(result);
						for (let i = 0; i < result.length; i++) {
							  // 第二步，请求发送模板消息
							  console.log("openid: " + result[i].openid);
							  console.log("form_id: "+ req.body.fId);
							  var res_sync=request('POST','https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + access_token,
							  {
								json: {
								  touser:result[i].openid,
								  template_id:"hsJnrBGbbV5CmWbKMj7T3bhhxCL4107f59zUVyearEc",
								  form_id: result[i].formId,
								  page:'/pages/user/user',
								  data: {
									"keyword1": {
												"value": req.body.keyword1,
												"color": "#173177"
												},
												"keyword2": {
												"value": req.body.keyword2,
												"color": "#173177"
												},
												"keyword3": {
												"value": req.body.keyword3,
												"color": "#173177"
												},
												"keyword4": {
												"value": req.body.keyword4,
												"color": "#173177"
									}
								  }
								}
							  }
							  );
							  var user = JSON.parse(res_sync.getBody('utf8'));
							  console.log(user);
							};
						
					} //else {
						//res.send(JSON.stringify({
						//	status: "fail"
						//}));
						//res.end();
					//}
					// 释放连接  
					connection.release();
				});
			});
		  
        //process.stdout.write(data);  
        });  
       
    }).on("error", function (err) {  
      console.log(err);  
    });
	
});
//插入formid
app.post('/update/formId',function(req,res){
                var fs=require('fs');
              console.log("开始插入formid");
			  console.log("formid:"+req.body.formId);
			  console.log("openid:"+req.body.openid);
			  
			pool.getConnection(function(err, connection) {
			connection.query(userSQL.formIdupdate,[req.body.formId,req.body.openid],function(err, result) {
                        if(result) {
						console.log(result);
                       // res.send(JSON.stringify(result[0]));
              		//res.end();
                        }
                        else
                        {
                         res.send(JSON.stringify({ status:"fail" }));res.end();
                        }
        // 释放连接  
                        connection.release();
         });
        });
})

module.exports = app;
