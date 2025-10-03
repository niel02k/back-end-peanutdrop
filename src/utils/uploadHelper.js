// Utilitário para configuração de upload de arquivos usando Multer
// Cada entidade (Demandas, Usuários, Ofertas) possui sua própria configuração e pasta

const multer = require('multer'); // Importa o Multer para upload de arquivos
const path = require('path');     // Importa o path para manipulação de caminhos

// Configuração de armazenamento para imagens de Demandas
const storageDemandas = multer.diskStorage({
  // Define o diretório de destino dos arquivos enviados
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/demandas'));
  },
  // Define o nome do arquivo salvo (único, baseado em timestamp e número aleatório)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Pega a extensão do arquivo original
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});

// Instância do Multer para Demandas
const uploadDemandas = multer({
  storage: storageDemandas,
  limits: { fileSize: 15 * 1024 * 1024 }, // Limite de 15MB para imagens
  fileFilter: (req, file, cb) => {
    // Permite apenas imagens nos formatos especificados
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// Configuração de armazenamento para imagens de Usuários
const storageUsuarios = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/usuarios'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});

// Instância do Multer para Usuários
const uploadUsuarios = multer({
  storage: storageUsuarios,
  limits: { fileSize: 15 * 1024 * 1024 }, // Limite de 15MB para imagens
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// Configuração de armazenamento para imagens de Ofertas
const storageOfertas = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/ofertas'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});

// Instância do Multer para Ofertas
const uploadOfertas = multer({
  storage: storageOfertas,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2MB para imagens
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// Exporta as instâncias de upload para uso nas rotas/controllers
module.exports = {
  uploadDemandas,   // Upload para imagens de demandas
  uploadUsuarios,   // Upload para imagens de usuários
  uploadOfertas     // Upload para imagens de ofertas
};
