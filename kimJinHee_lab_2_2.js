const http = require('http');
const request = require('request');
const fs = require('fs');
const json2csv = require('json2csv');

const server = http.createServer((req, res) => {
    const option = {
        url: "http://15.164.75.18:3000/homework/2nd",
        method: "GET"
    };

    request(option, (err, response, body) => {
        let data = {
            "msg": "",
            "resData": null,
            "resultCsv": null
        };



        if (err) {
            console.log(err);
            data.msg = "request err";
            res.writeHead(500, { 'Content-Type': "text/plain" });
            res.write(JSON.stringify(data));
            res.end();
        }
        else {
            console.log(body);
            const resData = JSON.parse(body).data;
            data.resData = resData;
            console.log(resData);


            const resultCsv = json2csv.parse({
                data: resData,
                fields: ["time"]
            });
            fs.writeFile('info.csv', resultCsv, (err) => {
                if (err) {
                    data.msg = "File storage error";
                    res.writeHead(500, { 'Content-Type': "text/plain" });
                    res.end();
                } else {
                    data.msg="all success"
                    res.writeHead(200, { 'Content-Type': "text/plain" });
                    res.write(JSON.stringify(data));
                    res.end();
                }
            });
        }
    })
}).listen(3000, () => {
    console.log("3000번 접속");
})