const express = require ('express');
const router = express.Router();

const RotasMarcos = require ('./routes-marcos');

router.use('/' , RotasMarcos );

module.exports = router;
