const express = require('express'); 
const router = express.Router(); 

const negociacoesController = require('../controllers/negociacoes'); 
const mensagemsController = require('../controllers/mensagem'); 
const usuariosController = require('../controllers/usuarios'); 

router.get('/usuarios', usuariosController.listarUsuarios); 
router.post('/usuarios', usuariosController.cadastrarUsuarios); 
router.patch('/usuarios', usuariosController.editarUsuarios); 
router.delete('/usuarios', usuariosController.apagarUsuarios); 


router.get('/negociacoes', negociacoesController.listarNegociacoes); 
router.post('/negociacoes', negociacoesController.cadastrarNegociacoes); 
router.patch('/negociacoes', negociacoesController.editarNegociacoes); 
router.delete('/negociacoes', negociacoesController.apagarNegociacoes); 

router.get('/mensagem', mensagemsController.listarMensagem); 
router.post('/mensagem', mensagemsController.cadastrarMensagem); 
router.patch('/mensagem', mensagemsController.editarMensagem); 
router.delete('/mensagem', mensagemsController.apagarMensagem); 

module.exports = router;