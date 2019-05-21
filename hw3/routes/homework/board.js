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
    } else {
        if (selectBoardResult[0] == null) {
            res.status(200).send(util.successFalse(statusCode.NOT_FOUND, resMessage.NULL_VALUE));
        } else {
            res.status(200).send(util.successTrue(statusCode.OK, resMessage.ROAD_SUCCESS, selectBoardResult));
        }
    }
});

router.get('/:idx', async (req, res) => {
    const selectBoardIdxQuery = 'SELECT title, content, writer, writetime FROM board WHERE boardIdx = ?';
    const selectBoardIdxResult = await pool.queryParam_Parse(selectBoardIdxQuery, [req.param.idx]);

    if (!selectBoardIdxResult) {
        res.status(200).send(util.successTrue(statusCode.OK, resMessage.ROAD_FAIL));
    } else {
        if (selectBoardIdxResult[0] == null) {
            res.status(200).send(util.successFalse(statusCode.NOT_FOUND, resMessage.NULL_VALUE, selectBoardIdxResult));
        } else {
            res.status(200).send(util.successTrue(statusCode.OK, resMessage.ROAD_SUCCESS, selectBoardIdxResult));
        }
    }
});

router.post('/', async (req, res) => {
    if (!req.body.title || !req.body.content || !req.body.boardPw || !req.body.writer) {
        res.status(200).send(util.successFalse(statusCode.OK, resMessage.BAD_REQUEST));
    } else {
        const buf = await crypto.randomBytes(64);
        const salt = buf.toString('base64');
        const pwd = req.body.boardPw;
        const hashedPw = await crypto.pbkdf2(pwd.toString(), salt, 1000, 32, 'SHA512');

        const writetime = moment().format('YYYYY-MM-DD HH:mm:ss');

        const insertBoardQuery = 'INSERT INTO board (writer, title, content, writetime, boardPw, salt) VALUES (?, ?, ?, ?, ?, ?)';
        const insertBoardResult = await pool.queryParam_Parse(insertBoardQuery,
            [req.body.writer, req.body.title, req.body.content, writetime, hashedPw.toString('base64'), salt]);

        if (!insertBoardResult) {
            res.status(200).send(util.successFalse(statusCode.OK, resMessage.SAVE_FAIL));
        } else {
            res.status(200).send(util.successTrue(statusCode.OK, resMessage.SAVE_SUCCESS));
        }
    }
});

router.delete('/', async (req, res) => {
    if (!req.body.boardIdx || !req.body.boardPw) {
        res.status(200).send(util.successFalse(statusCode.OK, resMessage.BAD_REQUEST));
    } else {
        const selectBoardIdxQuery = 'SELECT * FROM board WHERE boardIdx = ?';
        const selectBoardIdxResult = await pool.queryParam_Parse(selectBoardIdxQuery, [req.body.boardIdx]);

        if (!selectBoardIdxResult) {
            res.status(200).send(util.successTrue(statusCode.OK, resMessage.ROAD_FAIL));
        } else {
            if (selectBoardIdxResult[0] == null) {
                res.status(200).send(util.successFalse(statusCode.NOT_FOUND, resMessage.NULL_VALUE, selectBoardIdxResult));
            } else {
                const salt = selectBoardIdxResult[0].salt;
                const hashedPw = await crypto.pbkdf2(req.body.boardPw.toString(), salt, 1000, 32, 'SHA512');

                if (selectBoardIdxResult[0].boardPw == hashedPw.toString('base64')) {
                    const deleteBoardQuery = 'DELETE FROM board WHERE boardIdx= ? ';
                    const deleteBoardResult = await pool.queryParam_Parse(deleteBoardQuery, [req.body.boardIdx]);
                    if (!deleteBoardResult) {
                        res.status(200).send(util.successFalse(statusCode.DB_ERROR, resMessage.DELETE_FAIL));
                    } else {
                        res.status(200).send(util.successTrue(statusCode.OK, resMessage.DELETE_SUCCESS));
                    }
                }
                else {
                    res.status(200).send(util.successFalse(statusCode.OK, resMessage.MISS_MATCH_PW));
                }
            }
        }
    }
});
module.exports = router;
