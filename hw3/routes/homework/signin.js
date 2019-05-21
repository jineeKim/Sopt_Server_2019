var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');
const pool = require('../../module/pool');

const util = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');


router.post('/', async (req, res) => {
    const selectIdQuery = 'SELECT * FROM user WHERE id = ?';
    const selectResult = await pool.queryParam_Parse(selectIdQuery, [req.body.id]);
    const pwd = req.body.password;

    if(!selectResult){
        res.status(200).send(util.successFalse(statusCode.BAD_REQUEST, resMessage.ID_OR_PW_NULL_VALUE));
    }else{
        if (selectResult[0] == null) {
            res.status(200).send(util.successFalse(statusCode.OK, resMessage.MISS_MATCH_ID));
        } else {
            const hashedPw = await crypto.pbkdf2(pwd.toString(), selectResult[0].salt, 1000, 32, 'SHA512');
            if (selectResult[0].password == hashedPw.toString('base64')) {
                res.status(200).send(util.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS));
            } else {
                res.status(200).send(util.successFalse(statusCode.OK, resMessage.MISS_MATCH_PW));
            }
        }
    }
});

module.exports = router;