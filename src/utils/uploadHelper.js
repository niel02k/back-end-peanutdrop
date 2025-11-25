const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função para criar diretório se não existir
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Diretório criado: ${dirPath}`);
  }
};

// Configuração de armazenamento para imagens de Demandas
const storageDemandas = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../../uploads/demandas');
    ensureDir(uploadPath);
    console.log(`📁 Multer Demandas - Destino: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    console.log(`📁 Multer Demandas - Nome do arquivo: ${name}`);
    cb(null, name);
  }
});

// Instância do Multer para Demandas - ✅ CORRIGIDO
const uploadDemandas = multer({
  storage: storageDemandas,
  limits: { 
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    console.log('🔄 MULTER DEMANDAS - Processando arquivo...');
    console.log('   📝 Fieldname:', file.fieldname);
    console.log('   📝 Originalname:', file.originalname);
    console.log('   📝 Mimetype:', file.mimetype);
    console.log('   📝 Size:', file.size);
    
    // Permite apenas imagens
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ MULTER - Arquivo aceito');
      cb(null, true);
    } else {
      console.log('❌ MULTER - Tipo de arquivo não permitido');
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
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
