
const express = require('express'); 
const router = express.Router(); 

const negociacoesController = require('../controllers/negociacoes'); 
const mensagemsController = require('../controllers/mensagem'); 
const usuariosController = require('../controllers/usuarios'); 

router.get('/usuarios', usuariosController.listarUsuarios); 
router.post('/usuarios', usuariosController.cadastrarUsuarios); 
router.patch('/usuarios/:id', usuariosController.editarUsuarios); 
router.delete('/usuarios/:id', usuariosController.apagarUsuarios);
router.get('/login', usuariosController.login); 


router.get('/negociacoes', negociacoesController.listarNegociacoes); 
router.post('/negociacoes', negociacoesController.cadastrarNegociacoes); 
router.patch('/negociacoes/:id', negociacoesController.editarNegociacoes); 
router.delete('/negociacoes/:id', negociacoesController.apagarNegociacoes); 

router.get('/mensagem', mensagemsController.listarMensagem); 
router.post('/mensagem', mensagemsController.cadastrarMensagem); 
router.patch('/mensagem/:id', mensagemsController.editarMensagem); 
router.delete('/mensagem/:id', mensagemsController.apagarMensagem); 

module.exports = router;