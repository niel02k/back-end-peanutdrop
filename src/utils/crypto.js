/**
 * Utilitário para criptografia de senhas usando bcryptjs.
 * Fornece funções assíncronas para hash e comparação de senhas.
 */
const bcrypt = require('bcryptjs');

module.exports = {
  /**
   * Gera um hash seguro para a senha informada.
   * @param {string} password - Senha em texto puro a ser criptografada.
   * @returns {Promise<string>} - Hash gerado para a senha.
   */
  async hashPassword(password) {
    const saltRounds = 10; // Número de rounds para geração do salt
    return await bcrypt.hash(password, saltRounds); // Retorna o hash gerado
  },
  /**
   * Compara uma senha em texto puro com um hash previamente gerado.
   * @param {string} password - Senha em texto puro para verificação.
   * @param {string} hash - Hash da senha armazenado.
   * @returns {Promise<boolean>} - Retorna true se a senha corresponder ao hash, false caso contrário.
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash); // Retorna resultado da comparação
  }
};
