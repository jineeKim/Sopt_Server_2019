const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');
const fs = require('fs');
const json2csv = require('json2csv');
const csv2json = require('csv2json');

const server = http.createServer((request, response) => {
    const urlParsed = url.parse(request.url);
    const queryParsed = querystring.parse(urlParsed.query);
    const id = queryParsed.id;
    const pwd = queryParsed.pwd;
    let data = {
        "id": "",
        "pwd": null,
        "salt": null
    };

    if (urlParsed.pathname == '/signin') {
        crypto.randomBytes(32, (err, buf) => {
            if (err) {
                console.log(`randomBytes error: ${err}`);
                response.statusCode = 500;
                response.setHeader('Content-Type', 'text/plain');
                response.write(JSON.stringify(result));
            } else {
                const salt = buf.toString('base64');
                //console.log(`salt : ${salt}`);
                crypto.pbkdf2(pwd, salt, 10, 32, 'SHA512', (err, hashed) => {
                    if (err) {
                        console.log(`pbkdf2 error: ${err}`);
                        response.statusCode = 500;
                        response.setHeader('Content-Type', 'text/plain');
                        response.write(JSON.stringify(result));
                        response.end;
                    } else {
                        data.pwd = hashed.toString('base64');
                        data.id = id;
                        data.salt = salt;
                        const resultCsv = json2csv.parse({
                            data: data,
                            field: ["sign in"]
                        });
                        fs.writeFile('signIn.csv', resultCsv, (err) => {
                            if (err) {
                                console.log(`File storage error: ${err}`);
                                response.writeHead(500, { 'Content-Type': "text/plain" });
                                response.end();
                            } else {
                                const msg = "회원가입에 성공하였습니다!"
                                response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                                response.write(msg.toString('utf-8'));
                                response.end();
                            }
                        });
                    }
                })
            }
        })
    } else if (urlParsed.pathname == '/signup') {
        const csvFilePath = 'signIn.csv'
        csv2json().fromFile('signIn.csv').then((jsonObj)=>{
            console.log(jsonObj);
        })
        // fs.readFile('signIn.csv', 'utf8', function (err, data) {
        //     if (err) {
        //         console.log(`File read error: ${err}`);
        //         response.writeHead(500, { 'Content-Type': "text/plain" });
        //         response.end();
        //     } else {
        //         //var data1 = csv2json.csvtojson('signIn.csv'); 
        //         csv2json
        //         // let salt = JSON.stringify(data.salt);
        //         console.log(data);
        //         crypto.pbkdf2(pwd, salt, 10, 32, 'SHA512', (err, hashed) => {
        //             if (err) {
        //                 console.log(`pbkdf2 error: ${err}`);
        //                 response.statusCode = 500;
        //                 response.setHeader('Content-Type', 'text/plain');
        //                 response.write(JSON.stringify(result));
        //                 response.end;
        //             } else {
        //                 if (data.pwd = hashed.toString('base64')) {
        //                     const msg = "로그인에 성공하였습니다!"
        //                     response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        //                     response.write(msg);
        //                     response.end();
        //                 }
        //             }
        //         })
        //     }
        // });
    }


}).listen(3000, (req, res) => {
    console.log("3000포트로 접속");
});