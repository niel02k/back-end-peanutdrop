const express = require('express'); 
const router = express.Router(); 

const certificacoesController = require('../controllers/certificacoes');
const rastreamento_producaoController = require('../controllers/rastreamento_producao');
const agrCertificacoesController = require('../controllers/agrCertificacoes');


router.get('/certificacoes', certificacoesController.listarCertificacoes); 
router.post('/certificacoes', certificacoesController.cadastrarCertificacoes); 
router.patch('/certificacoes/:id', certificacoesController.editarCertificacoes); 
router.delete('/certificacoes/:id', certificacoesController.apagarCertificacoes); 

router.get('/rastreamento_producao', rastreamento_producaoController.listarRastreamento_producao); 
router.post('/rastreamento_producao', rastreamento_producaoController.cadastrarRastreamento_producao); 
router.patch('/rastreamento_producao/:id', rastreamento_producaoController.editarRastreamento_producao); 
router.delete('/rastreamento_producao/:id', rastreamento_producaoController.apagarRastreamento_producao); 

router.get('/agrCertificacoes', agrCertificacoesController.listarAgrcertificacoes); 
router.post('/agrCertificacoes', agrCertificacoesController.cadastrarAgrcertificacoes); 
router.patch('/agrCertificacoes/:id', agrCertificacoesController.editarAgrCertAtributos); 
router.delete('/agrCertificacoes/:id',agrCertificacoesController.apagarAgrcertificacoes); 

module.exports = router;