const express = require('express'); 
const router = express.Router(); 

const AgricultoresController = require('../controllers/Agricultores'); 
const AmendoinsController = require('../controllers/Amendoins'); 
const OfertasController = require('../controllers/Ofertas'); 
const { uploadOfertas } = require('../utils/uploadHelper');


router.get('/Agricultores', AgricultoresController.listarAgricultores); 
router.post('/Agricultores', AgricultoresController.cadastrarAgricultores); 
router.patch('/Agricultores/:id', AgricultoresController.editarAgricultores); 
router.delete('/Agricultores/:id', AgricultoresController.apagarAgricultores); 
router.get('/Agricultores/filtro', AgricultoresController.listarAgricultoresFiltro);

router.get('/Amendoins', AmendoinsController.listarAmendoins); 
router.post('/Amendoins', AmendoinsController.cadastrarAmendoins); 
router.patch('/Amendoins/:id', AmendoinsController.editarAmendoins); 
router.delete('/Amendoins/:id', AmendoinsController.apagarAmendoins); 
router.get('/Amendoins/filtro', AmendoinsController.listarAmendoinsFiltro);

router.get('/Ofertas', OfertasController.listarOfertas); 
router.post('/Ofertas', uploadOfertas.single('imagem'), OfertasController.cadastrarOfertas); 
router.patch('/Ofertas/:id', uploadOfertas.single('imagem'), OfertasController.editarOfertas); 
router.delete('/Ofertas/:id', OfertasController.apagarOfertas);
router.get('/Ofertas/filtro', OfertasController.listarOfertasFiltro); 



module.exports = router;