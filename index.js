require('dotenv').config();
const express = require('express'); 
const cors = require('cors');

const router = require('./src/routes/routes'); 

const app = express(); 
app.use(cors()); 
app.use(express.json()); 

app.use(router);

// Servir imagens estáticas da pasta uploads/demandas
app.use('/uploads/demandas', express.static(__dirname + '/uploads/demandas'));
// Servir arquivos estáticos da pasta uploads/agr_certificacoes
app.use('/uploads/agr_certificacoes', express.static(__dirname + '/uploads/agr_certificacoes'));
// Servir arquivos estáticos da pasta uploads/ofertas
app.use('/uploads/ofertas', express.static(__dirname + '/uploads/ofertas'));
// Servir arquivos estáticos da pasta uploads/usuarios
app.use('/uploads/usuarios', express.static(__dirname + '/uploads/usuarios'));

const porta = process.env.PORT || 3333;

app.listen(porta, () => {
    console.log(`Servidor iniciado em http://localhost:${porta}`);
});

app.get('/', (request, response) => {
    response.send('Hello World!!!');
});

