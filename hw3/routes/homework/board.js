const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const json2csv = require('async-json2csv');
const csv = require("csvtojson");
const fs = require("fs");
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const util = require('../../utils/utils');
const statusCode = require('../../utils/statusCode');
const resMessage = require('../../utils/responseMessage');

router.get('/:id', (req, res) => {
    const readCsv = (fileName) => {
        return new Promise((resolve, reject) => {
            csv().fromFile(fileName).then((jsonObj) => {
                if (jsonObj != null) {
                    console.log(`json object: ${jsonObj}`);
                    resolve(jsonObj);
                } else {
                    console.log("fail");
                    reject(resMessage.READ_FAIL);
                }
            })
        })
    }

    readCsv('boardInfo.csv')
        .then((boardData) => {
            for (var i = 0; i < boardData.length; i++) {
                if (boardData[i].id == req.params.id) {
                    console.log(`board data: ${boardData[i]}`);
                    break;
                }
            }

            if (i < boardData.length) {
                delete boardData[i].pwd;
                delete boardData[i].salt;
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.SEARCH_SUCCESS, boardData[i]));
            } else {
                res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NO_USER));
            }
        }, (message) => {
            console.log(`error: ${message}`);
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});

router.post('/', async (req, res) => {
    if (!req.body.id || !req.body.title) {
        res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        try {
            const boardInfo = {
                id: req.body.id,
                title: req.body.title,
                contents: req.body.contents,
                pwd: req.body.pwd
            }

            const salt = await crypto.randomBytes(32);
            const hashedPwd = await crypto.pbkdf2(boardInfo.pwd.toString(), salt.toString('base64'), 1000, 32, 'SHA512');

            boardInfo.salt = salt.toString('base64');
            boardInfo.pwd = hashedPwd.toString('base64');
            boardInfo.time = moment().format('HH:mm:ss');

            console.log(`${boardInfo.time}`);

            const options = {
                data: [boardInfo],
                fields: ['id', 'title', 'time', 'pwd', 'salt'],
                header: true
            }

            const boardInfoCsv = await json2csv(options);
            fs.writeFileSync('boardInfo.csv', boardInfoCsv);
            res.status(200).send(util.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS));
        }
        catch (err) {
            console.log(`err: ${err}`);
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SAVE_FAIL));
        }
    }
});

router.put('/', (req, res) => {
    const modifyCsv = (fileName) => {
        return new Promise((resolve, reject) => {
            csv().fromFile(fileName).then(async (jsonArray) => {
                if (jsonArray != null) {
                    console.log(`json object: ${jsonArray}`);
                    resolve(jsonArray);
                } else {
                    console.log("fail");
                    reject(resMessage.READ_FAIL);
                }
            })
        });
    }

    modifyCsv('boardInfo.csv')
        .then((jsonArray) => {
            var reqData = req.body;
            for (var i = 0; i < jsonArray.length; i++) {
                if (jsonArray[i].id === reqData.id) {
                    console.log(`여기?`);
                    const hashedPw = (crypto.pbkdf2('sha1', jsonArray[i].salt)(reqData.pw)).toString('base64');
                    if (jsonArray[i].pw === hashedPw) {
                        jsonArray[i].contents = reqData.contents;
                        jsonArray[i].title = reqData.title;
                        jsonArray[i].time = moment().format('YYYY-MM-DD HH:mm:ss');
                        try {
                            const options = {
                                data: [boardInfo],
                                fields: ['id', 'title', 'time', 'pwd', 'salt'],
                                header: true
                            }

                            const boardInfoCsv = json2csv(options);
                            fs.writeFileSync('boardInfo.csv', boardInfoCsv);
                            resolve()
                        }
                        catch (err) {
                            reject(responseMessage.CREATED_FAIL);
                        }
                    }
                    reject(responseMessage.MISS_MATCH_PW);
                }
            }
        }, (message) => {
            console.log(`error: ${message}`);
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});

router.delete('/', (req, res) => {
    console.log(req.body);
    const deleteCsv = (fileName) => {
        return new Promise((resolve, reject) => {
            csv().fromFile(fileName).then(async (jsonArray) => {
                if (jsonArray != null) {
                    console.log(`json object: ${jsonArray}`);
                    resolve(jsonArray);
                } else {
                    console.log("fail");
                    reject(resMessage.READ_FAIL);
                }
            })
        });
    }

    deleteCsv('boardInfo.csv')
        .then((jsonArray) => {
            const reqData = req.body;
            if (!reqData.id || !reqData.title || !reqData.contents || !reqData.pw)
                res.send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            else{
                for(let  i = 0 ; i <jsonArray.length; i++){
                    if(jsonArray[i].id === reqData.id){
                        const hashedPw = (crypto.pbkdf2('sha1', jsonArray[i].salt)(reqData.pw)).toString('base64');
                        if(jsonArray[i].pw === hashedPw){
                            jsonArray.splice(i,1);
                                try{     
                                    let csv = parser.parse(jsonArray,fields);
                                    fs.writeFileSync(boardPath,csv);
                                    resolve();
                                }
                                catch(err){
                                        reject(responseMessage.DELETE_FAIL);
                                }
                            }
                            reject(responseMessage.MISS_MATCH_PW);
                    }
                }
                res.send(utils.successTrue(statusCode.OK, responseMessage.DELETE_SUCCESS));
            }
        }, (message) => {
            console.log(`error: ${message}`);
            res.status(200).send(util.successFalse(statusCode.INTERNAL_SERVER_ERROR, message));
        });
});

module.exports = router;
