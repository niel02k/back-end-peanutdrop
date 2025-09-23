const crypto = require('./crypto');

async function test() {
  const senha = 'Teste123!';
  const hash = await crypto.hashPassword(senha);
  const ok = await crypto.comparePassword(senha, hash);
  const fail = await crypto.comparePassword('errada', hash);
  console.log('Hash:', hash);
  console.log('Senha correta:', ok);
  console.log('Senha errada:', fail);
}

test();
