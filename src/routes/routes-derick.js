const express = require('express'); 
const router = express.Router(); 

const EmpresasController = require('../controllers/Empresas'); 
const DemandasController = require('../controllers/Demandas'); 
const PropostasController = require('../controllers/Propostas'); 

router.get('/empresas', EmpresasController.listarEmpresas); 
router.post('/empresas', EmpresasController.cadastrarEmpresas); 
router.patch('/empresas/:id', EmpresasController.editarEmpresas); 
router.delete('/empresas/:id', EmpresasController.apagarEmpresas); 

router.get('/demandas', DemandasController.listarDemandas); 
router.post('/demandas', DemandasController.cadastrarDemandas); 
router.patch('/demandas/:id', DemandasController.editarDemandas); 
router.delete('/demandas/:id', DemandasController.apagarDemandas); 

router.get('/propostas', PropostasController.listarPropostas); 
router.post('/propostas', PropostasController.cadastrarPropostas); 
router.patch('/propostas/:id', PropostasController.editarPropostas); 
router.delete('/propostas/:id', PropostasController.apagarPropostas);



module.exports = router;