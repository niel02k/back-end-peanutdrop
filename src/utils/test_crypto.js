/**
 * Teste das funções de criptografia de senha do utilitário crypto.js
 * Executa hash de uma senha, verifica correspondência correta e incorreta.
 */
const crypto = require('./crypto');

async function test() {
  const senha = 'Teste123!'; // Senha de teste
  const hash = await crypto.hashPassword(senha); // Gera hash da senha
  const ok = await crypto.comparePassword(senha, hash); // Deve retornar true
  const fail = await crypto.comparePassword('errada', hash); // Deve retornar false
  console.log('Hash:', hash); // Exibe o hash gerado
  console.log('Senha correta:', ok); // Exibe resultado da comparação correta
  console.log('Senha errada:', fail); // Exibe resultado da comparação incorreta
}

test(); // Executa o teste
