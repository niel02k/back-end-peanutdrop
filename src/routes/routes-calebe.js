const express = require('express'); 
const router = express.Router(); 

const ContratosController = require('../controllers/Contratos'); 
const Notas_fiscaisController = require ('../controllers/Notas_fiscais'); 
const PagamentosController = require ('../controllers/Pagamentos'); 

router.get('/Contratos', ContratosController.listarContratos); 
router.post('/Contratos', ContratosController.cadastrarContratos); 
router.patch('/Contratos/:id', ContratosController.editarContratos); 
router.delete('/Contratos/:id', ContratosController. apagarContratos); 

router.get('/Notas_fiscais', Notas_fiscaisController.listarNotas_fiscais); 
router.post('/Notas_fiscais', Notas_fiscaisController.cadastrarNotas_fiscais); 
router.patch('/Notas_fiscais/:id', Notas_fiscaisController.editarNotas_fiscais); 
router.delete('/Notas_fiscais/:id',Notas_fiscaisController.apagarNotas_fiscais); 


router.get('/Pagamentos',   PagamentosController.listarPagamentos); 
router.post('/Pagamentos', PagamentosController.cadastrarPagamentos); 
router.patch('/Pagamentos/:id', PagamentosController.editarPagamentos); 
router.delete('/Pagamentos/:id',PagamentosController.apagarPagamentos); 



module.exports = router;