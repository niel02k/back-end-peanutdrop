const express = require ('express');
const router = express.Router();

const RotasMarcos = require ('./routes-marcos');
const RotasDerick = require ('./routes-derick');
const RotasGiovanny = require ('./routesGiovanny');
const RotasFabricio = require ('./routes -fabricio');
const RotasCalebe = require ('./routes-calebe')

router.use('/' , RotasMarcos );
router.use('/' , RotasDerick );
router.use('/' , RotasGiovanny );
router.use('/' , RotasFabricio );
router.use('/' , RotasCalebe );

module.exports = router;
