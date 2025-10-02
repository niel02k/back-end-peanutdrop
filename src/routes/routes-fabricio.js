const express = require('express'); 
const router = express.Router(); 

const CertificacoesController = require('../controllers/Certificacoes');
const RastreamentoController = require('../controllers/Rastreamento');
const AgrcertificacoesController = require('../controllers/Agrcertificacoes');
const upload = require('../utils/uploadHelper');


router.get('/Certificacoes', CertificacoesController.listarCertificacoes); 
router.post('/Certificacoes', CertificacoesController.cadastrarCertificacoes); 
router.patch('/Certificacoes/:id', CertificacoesController.editarCertificacoes); 
router.delete('/Certificacoes/:id', CertificacoesController.apagarCertificacoes); 
router.get('/Certificacoes/filtro', CertificacoesController.listarCertificacoesFiltro);

router.get('/Rastreamento', RastreamentoController.listarRastreamento); 
router.post('/Rastreamento', RastreamentoController.cadastrarRastreamento); 
router.patch('/Rastreamento/:id', RastreamentoController.editarRastreamento); 
router.delete('/Rastreamento/:id', RastreamentoController.apagarRastreamento); 
router.get('/Rastreamento/filtro', RastreamentoController.listarRastreamentoFiltro)

router.get('/Agr_cetificacoes', AgrcertificacoesController.listarAgrcertificacoes ); 
router.post('/Agr_cetificacoes', upload.single('agr_arquivo'), AgrcertificacoesController.cadastrarAgrcertificacoes ); 
router.patch('/Agr_cetificacoes/id', AgrcertificacoesController.editarAgrcertificacoes ); 
router.delete('/Agr_cetificacoes/id', AgrcertificacoesController.apagarAgrcertificacoes );
router.get('/Agr_cetificacoes/filtro', AgrcertificacoesController.listarAgrcertificacoesFiltro);


module.exports = router;