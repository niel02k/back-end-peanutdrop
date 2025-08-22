const express = require('express'); 
const router = express.Router(); 

const CertificacoesController = require('../controllers/Certificacoes');
const RastreamentoController = require('../controllers/Rastreamento');
const AgrcertificacoesController = require('../controllers/Agrcertificacoes');


router.get('/Certificacoes', CertificacoesController.listarCertificacoes); 
router.post('/Certificacoes', CertificacoesController.cadastrarCertificacoes); 
router.patch('/Certificacoes/:id', CertificacoesController.editarCertificacoes); 
router.delete('/Certificacoes/:id', CertificacoesController.apagarCertificacoes); 

router.get('/Rastreamento', RastreamentoController.listarRastreamento); 
router.post('/Rastreamento', RastreamentoController.cadastrarRastreamento); 
router.patch('/Rastreamento/:id', RastreamentoController.editarRastreamento); 
router.delete('/Rastreamento/:id', RastreamentoController.apagarRastreamento); 

router.get('/Agr_cetificacoes', AgrcertificacoesController.listarAgrcertificacoes ); 
router.post('/Agr_cetificacoes', AgrcertificacoesController.cadastrarAgrcertificacoes ); 
router.patch('/Agr_cetificacoes/id', AgrcertificacoesController.editarAgrcertificacoes ); 
router.delete('/Agr_cetificacoes/id', AgrcertificacoesController.apagarAgrcertificacoes );


module.exports = router;