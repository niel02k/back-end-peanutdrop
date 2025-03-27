const express = require ('express')

const app = express();

const porta =333;

app.listen(porta, () => {
    console.log(`Servidor iniciado na porta ${porta}`);

});