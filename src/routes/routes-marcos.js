const express = require('express'); 
const router = express.Router(); 

const NegociacoesController = require('../controllers/negociacoes'); 
const MensagemsController = require('../controllers/Mensagem'); 
const UsuariosController = require('../controllers/usuarios');
const { route } = require('./routes-calebe');

// CRUD básico
router.get('/usuarios', UsuariosController.listarUsuarios);
router.post('/usuarios', UsuariosController.cadastrarUsuarios);
router.patch('/usuarios/:id', UsuariosController.editarUsuarios);
router.delete('/usuarios/:id', UsuariosController.apagarUsuarios);
// Login
router.post('/usuarios/login', UsuariosController.login);
// Listagem com filtros/paginação
router.get('/usuarios/filtros', UsuariosController.listarUsuariosFiltro);


router.get('/Negociacoes', NegociacoesController.listarNegociacoes); 
router.post('/Negociacoes', NegociacoesController.cadastrarNegociacoes); 
router.patch('/Negociacoes/:id', NegociacoesController.editarNegociacoes); 
router.delete('/Negociacoes/:id', NegociacoesController.apagarNegociacoes); 
router.get('/Negociacoes/filtro', NegociacoesController.listarNegociacoesFiltro);

router.get('/Mensagem', MensagemsController.listarMensagem); 
router.post('/Mensagem', MensagemsController.cadastrarMensagem); 
router.patch('/Mensagem/:id', MensagemsController.editarMensagem); 
router.delete('/Mensagem/:id', MensagemsController.apagarMensagem); 
router.get('/Mensagem/filtro', MensagemsController.listarMensagemFiltro);

module.exports = router;