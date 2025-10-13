const fse = require('fs-extra');
const path = require('path');
const { URL } = require('url');

const PUBLIC_ROOT_PATH = path.join(process.cwd(), 'public' );  
const API_URL = process.env.API_BASE_URL || 'http://localhost:3333';



function gerarUrl(nomeArquivo, pasta, arquivoPadrao) {
  const arquivoVerificar = nomeArquivo || arquivoPadrao;
  const caminhoFisico = path.join(UPLOADS_ROOT_PATH, pasta, arquivoVerificar);

  let caminhoRelativo;
  if (nomeArquivo && fse.existsSync(caminhoFisico)) {
    caminhoRelativo = path.join('/uploads', pasta, nomeArquivo);
  } else {
    caminhoRelativo = path.join('/uploads', pasta, arquivoPadrao);
  }
  const caminhoRelativoFormatado = caminhoRelativo.replace(/\\/g, '/');
  const urlCompleta = new URL(caminhoRelativoFormatado, API_URL);
  return urlCompleta.href;
}

module.exports = { gerarUrl };
