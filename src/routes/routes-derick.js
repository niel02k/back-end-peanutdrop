const express = require('express'); 
const router = express.Router(); 

const EmpresasController = require('../controllers/Empresas'); 
const DemandasController = require('../controllers/Demandas');  // ← COM "D" maiúsculo
const PropostasController = require('../controllers/Propostas'); 
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/Empresas', EmpresasController.listarEmpresas); 
router.post('/Empresas', EmpresasController.cadastrarEmpresas); 
router.patch('/Empresas/:id', EmpresasController.editarEmpresas); 
router.delete('/Empresas/:id', EmpresasController.apagarEmpresas); 
router.get('/Empresas/filtro', EmpresasController.listarEmpresasFiltro);

router.get('/Demandas', DemandasController.listarDemandas); 
router.post('/demandas', upload.single('imagem'), DemandasController.cadastrarDemandas);
router.patch('/Demandas/:id', DemandasController.editarDemandas); 
router.delete('/Demandas/:id', DemandasController.apagarDemandas); 
router.get('/Demandas/filtro', DemandasController.listarDemandasFiltro);

router.get('/Propostas', PropostasController.listarPropostas); 
router.post('/Propostas', PropostasController.cadastrarPropostas); 
router.patch('/Propostas/:id', PropostasController.editarPropostas); 
router.delete('/Propostas/:id', PropostasController.apagarPropostas);
router.get('/Propostas/filtro', PropostasController.listarPropostasFiltro);

module.exports = router;