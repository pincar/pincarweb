var PORT = 3000;

var http = require('http');
var url=require('url');
var fs=require('fs');
var mine=require('./mine').types;
var path=require('path');

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = path.join(".", pathname);
    console.log(realPath);
	if(realPath.indexOf("zhaoren")>=0) {
		//console.log('zr:'+pathname);
		var resData = {
			data : [
            {
                userId : 111,
                nickname: '',
                startpoint: '泥城',
                destination : '张江',
                time : '2016-03-28T09:10',
                mobileNo : '138xxxx1234'
            },{
                userId : 123,
                nickname: '',
                startpoint: '东港',
                destination : '金科路',
                time : '2016-03-29T09:10',
                mobileNo : '131xxxx1001'
            }
        ]
		};
		response.writeHead(200, {
                        'Content-Type': 'charset:utf-8;application/json'
                    });
		response.write(JSON.stringify(resData));
		response.end();
		return;
	}
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            fs.readFile(realPath, function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
					console.log(ext);
                    var contentType = mine[ext] || "text/plain";
					console.log(contentType);
                    //response.writeHead(200, {
                    //    'Content-Type': contentType
                    //});
                    response.write(file);
                    response.end();
                }
            });
        }
    });
});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");