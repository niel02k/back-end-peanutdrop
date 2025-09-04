
const express = require('express'); 
const router = express.Router(); 

const NegociacoesController = require('../controllers/negociacoes'); 
const MensagemsController = require('../controllers/Mensagem'); 
const UsuariosController = require('../controllers/Usuarios'); 
const { route } = require('./routes-calebe');

router.get('/Usuarios', UsuariosController.listarUsuarios); 
router.post('/Usuarios', UsuariosController.cadastrarUsuarios); 
router.patch('/Usuarios/:id', UsuariosController.editarUsuarios); 
router.delete('/Usuarios/:id', UsuariosController.apagarUsuarios);
router.get('/login', UsuariosController.login); 
router.get ('/Filtros', UsuariosController.listarUsuariosFiltro)


router.get('/Negociacoes', NegociacoesController.listarNegociacoes); 
router.post('/Negociacoes', NegociacoesController.cadastrarNegociacoes); 
router.patch('/Negociacoes/:id', NegociacoesController.editarNegociacoes); 
router.delete('/Negociacoes/:id', NegociacoesController.apagarNegociacoes); 
router.get('/Negociacoes', NegociacoesController.listarNegociacoesFiltro);

router.get('/Mensagem', MensagemsController.listarMensagem); 
router.post('/Mensagem', MensagemsController.cadastrarMensagem); 
router.patch('/Mensagem/:id', MensagemsController.editarMensagem); 
router.delete('/Mensagem/:id', MensagemsController.apagarMensagem); 

module.exports = router;