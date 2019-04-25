const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto=require('crypto');

const server = http.createServer((request, response) => {
    const urlParsed = url.parse(request.url);
    const queryParsed = querystring.parse(urlParsed.query);
    const str = queryParsed.str;
    let data = {
        "msg": "",
        "hashed": null
    };

    crypto.randomBytes(32, (err, buf)=>{
        if(err){
            // console.log(err);
            data.msg="randomBytes err";

            response.statusCode = 500;
            response.setHeader('Content-Type', 'text/plain');
            response.write(JSON.stringify(result));
        }else{
            const salt = buf.toString('base64');
            console.log(`salt : ${salt}`);
            crypto.pbkdf2(str, salt, 10, 32, 'SHA512', (err, hashed)=>{
                if(err){
                    data.meg="pbkdf2 err";
                    response.statusCode=500;
                    response.setHeader('Content-Type', 'text/plain');
                    response.write(JSON.stringify(result));
                    response.end;
                    //console.log(err);
                }else{
                    data.meg='success';
                    data.hashed = hashed.toString('base64');

                    //응답을 줄 때 상태코드를 지정합니다.
                    response.statusCode = 200;
                    //응답 헤더를 셋팅합니다.
                    response.setHeader('Content-Type', 'text/plain');
                    response.write(JSON.stringify(data));
                    response.end();
                }
            })
        }
    })

}).listen(3000, (req, res)=> {
    console.log("3000포트로 접속");
});