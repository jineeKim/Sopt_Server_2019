const express = require('express');
const router = express.Router();

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const crypto = require('crypto-promise');
const pool = require('../../module/pool');

const util = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

router.get('/', async (req, res) => {
    const selectBoardQuery = 'SELECT title, content, writer, writetime FROM board';
    const selectBoardResult = await pool.queryParam_None(selectBoardQuery);

    if (!selectBoardResult) {
        res.status(200).send(util.successTrue(statusCode.OK, resMessage.ROAD_FAIL));
    }else{
        if (selectBoardResult[0] == null) {
            res.status(200).send(util.successFalse(statusCode.NOT_FOUND, resMessage.NULL_VALUE));
        } else {
            res.status(200).send(util.successTrue(statusCode.OK, resMessage.ROAD_SUCCESS));
        }
    }
});

module.exports = router;
