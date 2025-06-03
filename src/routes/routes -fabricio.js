const express = require('express'); 
const router = express.Router(); 

const certificacoesController = require('../controllers/certificacoes');
const rastreamento_producaoController = require('../controllers/rastreamento_producao');
const agrCertificacoesController = require('../controllers/agrCertificacoes');


router.get('/certificacoes', certificacoesController.listarCertificacoes); 
router.post('/certificacoes', certificacoesController.cadastrarCertificacoes); 
router.patch('/certificacoes/:id', certificacoesController.editarCertificacoes); 
router.delete('/certificacoes/:id', certificacoesController.apagarCertificacoes); 

router.get('/rastreamento_producao', rastreamento_producaoController.listarRastreamento); 
router.post('/rastreamento_producao', rastreamento_producaoController.cadastrarRastreamento); 
router.patch('/rastreamento_producao/:id', rastreamento_producaoController.editarRastreamento); 
router.delete('/rastreamento_producao/:id', rastreamento_producaoController.apagarRastreamento); 

router.get('/agrCertificacoes', agrCertificacoesController.listarAgr_certificacoes); 
router.post('/agrCertificacoes', agrCertificacoesController.cadastrarAgr_certificacoes); 
router.patch('/agrCertificacoes/:id', agrCertificacoesController.editarAgr_certificacoes); 
router.delete('/agrCertificacoes/:id',agrCertificacoesController.apagarAgr_certificacoes); 

module.exports = router;