const express = require('express'); 
const router = express.Router(); 

const ContratosController = require('../controllers/Contratos'); 
const Notas_fiscaisController = require ('../controllers/notas_fiscais'); 
const PagamentosController = require ('../controllers/Pagamentos'); 

router.get('/Contratos', ContratosController.listarContratos); 
router.post('/Contratos', ContratosController.cadastrarContratos); 
router.patch('/Contratos/:id', ContratosController.editarContratos); 
router.delete('/Contratos/:id', ContratosController. apagarContratos); 

router.get('/notas_fiscais', Notas_fiscaisController.listarNotas_fiscais); 
router.post('/notas_fiscais', Notas_fiscaisController.cadastrarNotas_fiscais); 
router.patch('/notas_fiscais/:id', Notas_fiscaisController.editarNotas_fiscais); 
router.delete('/notas_fiscais/:id',Notas_fiscaisController.apagarNotas_fiscais); 
router.get('/notas_fiscais', Notas_fiscaisController.listarNotas_fiscaisFiltro);


router.get('/Pagamentos',   PagamentosController.listarPagamentos); 
router.post('/Pagamentos', PagamentosController.cadastrarPagamentos); 
router.patch('/Pagamentos/:id', PagamentosController.editarPagamentos); 
router.delete('/Pagamentos/:id',PagamentosController.apagarPagamentos); 
router.get('/Pagamentos', PagamentosController.listarPagamentosFiltro);



module.exports = router;