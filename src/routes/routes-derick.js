const express = require('express'); 
const router = express.Router(); 

const EmpresasController = require('../controllers/Empresas'); 
const DemandasController = require('../controllers/Demandas'); 
const PropostasController = require('../controllers/Propostas'); 

router.get('/Empresas', EmpresasController.listarEmpresas); 
router.post('/Empresas', EmpresasController.cadastrarEmpresas); 
router.patch('/Empresas/:id', EmpresasController.editarEmpresas); 
router.delete('/Empresas/:id', EmpresasController.apagarEmpresas); 

router.get('/Demandas', DemandasController.listarDemandas); 
router.post('/Demandas', DemandasController.cadastrarDemandas); 
router.patch('/Demandas/:id', DemandasController.editarDemandas); 
router.delete('/Demandas/:id', DemandasController.apagarDemandas); 

router.get('/Propostas', PropostasController.listarPropostas); 
router.post('/Propostas', PropostasController.cadastrarPropostas); 
router.patch('/Propostas/:id', PropostasController.editarPropostas); 
router.delete('/Propostas/:id', PropostasController.apagarPropostas);



module.exports = router;