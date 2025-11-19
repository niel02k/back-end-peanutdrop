const express = require('express');
const router = express.Router();

// Controllers principais
const NegociacoesController = require('../controllers/Negociacoes'); // ← COM 'N' maiúsculo
const MensagemsController = require('../controllers/Mensagem'); // ← COM 'M' maiúsculo  
const UsuariosController = require('../controllers/usuarios'); // ← COM 'U' maiúsculo
const ContratosController = require('../controllers/Contratos'); // ← COM 'C' maiúsculo
const Notas_fiscaisController = require('../controllers/Notas_fiscais'); // ← COM 'N' maiúsculo
const PagamentosController = require('../controllers/Pagamentos'); // ← COM 'P' maiúsculo
const EmpresasController = require('../controllers/Empresas'); // ← COM 'E' maiúsculo
const DemandasController = require('../controllers/Demandas'); // ← COM 'D' maiúsculo
const PropostasController = require('../controllers/Propostas'); // ← COM 'P' maiúsculo
const CertificacoesController = require('../controllers/Certificacoes'); // ← COM 'C' maiúsculo
const RastreamentoController = require('../controllers/Rastreamento'); // ← COM 'R' maiúsculo
const AgrcertificacoesController = require('../controllers/Agrcertificacoes'); // ← Já estava certo
const AgricultoresController = require('../controllers/Agricultores'); // ← Já estava certo
const AmendoinsController = require('../controllers/Amendoins'); // ← Já estava certo
const OfertasController = require('../controllers/Ofertas'); // ← Já estava certo

// Utils
const { uploadUsuarios, uploadOfertas } = require('../utils/uploadHelper');

const { gerarUrl } = require('../utils/gerarUrl');

// ROTAS DE USUÁRIOS
router.get('/usuarios', UsuariosController.listarUsuarios);
router.get('/usuarios/filtros', UsuariosController.listarUsuariosFiltro);
router.get('/usuarios/:id', UsuariosController.buscarUsuarioPorId);
router.post('/usuarios', uploadUsuarios.single('imagem'), UsuariosController.cadastrarUsuarios);
router.patch('/usuarios/:id', uploadUsuarios.single('imagem'), UsuariosController.editarUsuarios);
router.delete('/usuarios/:id', UsuariosController.apagarUsuarios);
router.post('/usuarios/login', UsuariosController.login);

// ROTAS DE NEGOCIAÇÕES
router.get('/Negociacoes', NegociacoesController.listarNegociacoes);
router.post('/Negociacoes', NegociacoesController.cadastrarNegociacoes);
router.patch('/Negociacoes/:id', NegociacoesController.editarNegociacoes);
router.delete('/Negociacoes/:id', NegociacoesController.apagarNegociacoes);
router.get('/Negociacoes/filtro', NegociacoesController.listarNegociacoesFiltro);

// ROTAS DE MENSAGENS
router.get('/Mensagem', MensagemsController.listarMensagem);
router.post('/Mensagem', MensagemsController.cadastrarMensagem);
router.patch('/Mensagem/:id', MensagemsController.editarMensagem);
router.delete('/Mensagem/:id', MensagemsController.apagarMensagem);
router.get('/Mensagem/filtro', MensagemsController.listarMensagemFiltro);

// ROTAS DE CONTRATOS
router.get('/Contratos', ContratosController.listarContratos);
router.post('/Contratos', ContratosController.cadastrarContratos);
router.patch('/Contratos/:id', ContratosController.editarContratos);
router.delete('/Contratos/:id', ContratosController.apagarContratos);
router.get('/Contratos/filtro', ContratosController.listarContratosFiltro);

// ROTAS DE NOTAS FISCAIS
router.get('/notas_fiscais', Notas_fiscaisController.listarNotas_fiscais);
router.post('/notas_fiscais', Notas_fiscaisController.cadastrarNotas_fiscais);
router.patch('/notas_fiscais/:id', Notas_fiscaisController.editarNotas_fiscais);
router.delete('/notas_fiscais/:id', Notas_fiscaisController.apagarNotas_fiscais);
router.get('/notas_fiscais/filtro', Notas_fiscaisController.listarNotas_fiscaisFiltro);

// ROTAS DE PAGAMENTOS
router.get('/Pagamentos', PagamentosController.listarPagamentos);
router.post('/Pagamentos', PagamentosController.cadastrarPagamentos);
router.patch('/Pagamentos/:id', PagamentosController.editarPagamentos);
router.delete('/Pagamentos/:id', PagamentosController.apagarPagamentos);
router.get('/Pagamentos/filtro', PagamentosController.listarPagamentosFiltro);

// ROTAS DE EMPRESAS
router.get('/Empresas', EmpresasController.listarEmpresas);
router.post('/Empresas', EmpresasController.cadastrarEmpresas);
router.patch('/Empresas/:id', EmpresasController.editarEmpresas);
router.delete('/Empresas/:id', EmpresasController.apagarEmpresas);
router.get('/Empresas/filtro', EmpresasController.listarEmpresasFiltro);

// ROTAS DE DEMANDAS
router.get('/Demandas', DemandasController.listarDemandas);
router.post('/Demandas', uploadUsuarios.single('imagem'), DemandasController.cadastrarDemandas); // ← Usando uploadUsuarios existente
router.patch('/Demandas/:id', DemandasController.editarDemandas);
router.delete('/Demandas/:id', DemandasController.apagarDemandas);
router.get('/Demandas/filtro', DemandasController.listarDemandasFiltro);

// ROTAS DE PROPOSTAS
router.get('/Propostas', PropostasController.listarPropostas);
router.post('/Propostas', PropostasController.cadastrarPropostas);
router.patch('/Propostas/:id', PropostasController.editarPropostas);
router.delete('/Propostas/:id', PropostasController.apagarPropostas);
router.get('/Propostas/filtro', PropostasController.listarPropostasFiltro);

// ROTAS DE CERTIFICAÇÕES
router.get('/Certificacoes', CertificacoesController.listarCertificacoes);
router.post('/Certificacoes', CertificacoesController.cadastrarCertificacoes);
router.patch('/Certificacoes/:id', CertificacoesController.editarCertificacoes);
router.delete('/Certificacoes/:id', CertificacoesController.apagarCertificacoes);
router.get('/Certificacoes/filtro', CertificacoesController.listarCertificacoesFiltro);

// ROTAS DE RASTREAMENTO
router.get('/Rastreamento', RastreamentoController.listarRastreamento);
router.post('/Rastreamento', RastreamentoController.cadastrarRastreamento);
router.patch('/Rastreamento/:id', RastreamentoController.editarRastreamento);
router.delete('/Rastreamento/:id', RastreamentoController.apagarRastreamento);
router.get('/Rastreamento/filtro', RastreamentoController.listarRastreamentoFiltro);

// ROTAS DE AGRCERTIFICAÇÕES
router.get('/Agr_certificacoes', AgrcertificacoesController.listarAgrcertificacoes);
router.post('/Agr_certificacoes', uploadUsuarios.single('agr_arquivo'), AgrcertificacoesController.cadastrarAgrcertificacoes); // ← Descomentado e corrigido
router.patch('/Agr_certificacoes/:id', AgrcertificacoesController.editarAgrcertificacoes); // ← Corrigido :id
router.delete('/Agr_certificacoes/:id', AgrcertificacoesController.apagarAgrcertificacoes); // ← Corrigido :id
router.get('/Agr_certificacoes/filtro', AgrcertificacoesController.listarAgrcertificacoesFiltro);

// ROTAS DE AGRICULTORES
router.get('/Agricultores', AgricultoresController.listarAgricultores);
router.post('/Agricultores', AgricultoresController.cadastrarAgricultores);
router.patch('/Agricultores/:id', AgricultoresController.editarAgricultores);
router.delete('/Agricultores/:id', AgricultoresController.apagarAgricultores);
router.get('/Agricultores/filtro', AgricultoresController.listarAgricultoresFiltro);

// ROTAS DE AMENDOINS
router.get('/Amendoins', AmendoinsController.listarAmendoins);
router.post('/Amendoins', AmendoinsController.cadastrarAmendoins);
router.patch('/Amendoins/:id', AmendoinsController.editarAmendoins);
router.delete('/Amendoins/:id', AmendoinsController.apagarAmendoins);
router.get('/Amendoins/filtro', AmendoinsController.listarAmendoinsFiltro);

// ROTAS DE OFERTAS
router.get('/Ofertas', OfertasController.listarOfertas);
router.post('/Ofertas', uploadOfertas.single('imagem'), OfertasController.cadastrarOfertas);
router.patch('/Ofertas/:id', uploadOfertas.single('imagem'), OfertasController.editarOfertas);
router.delete('/Ofertas/:id', OfertasController.apagarOfertas);
router.get('/ofertas/:id', OfertasController.listarOfertasPorId);

module.exports = router;