const express = require('express'); 
const router = express.Router(); 

const CertificacoesController = require('../controllers/Certificacoes');
const RastreamentoController = require('../controllers/Rastreamento');
const Agr_cetificacoesController = require('../controllers/Agr_cetificacoes');


router.get('/Certificacoes', CertificacoesController.listarCertificacoes); 
router.post('/Certificacoes', CertificacoesController.cadastrarCertificacoes); 
router.patch('/Certificacoes/:id', CertificacoesController.editarCertificacoes); 
router.delete('/Certificacoes/:id', CertificacoesController.apagarCertificacoes); 

router.get('/Rastreamento', RastreamentoController.listarRastreamento); 
router.post('/Rastreamento', RastreamentoController.cadastrarRastreamento); 
router.patch('/Rastreamento/:id', RastreamentoController.editarRastreamento); 
router.delete('/Rastreamento/:id', RastreamentoController.apagarRastreamento); 

router.get('/Agr_cetificacoes', Agr_cetificacoesController.listarAgr_cetificacoes); 
router.post('/Agr_cetificacoes', Agr_cetificacoesController.cadastrarAgr_cetificacoes); 
router.patch('/Agr_cetificacoes/:id', Agr_cetificacoesController.editarAgrCertAtributos); 
router.delete('/Agr_cetificacoes/:id',Agr_cetificacoesController.apagarAgr_cetificacoes); 

module.exports = router;