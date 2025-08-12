// Controllers atualizados conforme Apostilas 004 (Consultas) e 005 (Validações)
// Padrões aplicados: filtros por query, paginação, JOINs (quando indicado), tratamento de BIT, try/catch, status HTTP consistentes.
// Observação: ajuste nomes de tabelas/colunas conforme seu schema real.

const db = require('../dataBase/connection'); // usa mysql2/promise com pool
/** Helpers comuns **/
function buildPagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.max(parseInt(query.limit || '20', 10), 1);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function pickFilters(query, allowed) {
  const where = [];
  const values = [];
  for (const key of allowed) {
    if (query[key] !== undefined && query[key] !== '') {
      where.push(`${key} LIKE ?`);
      values.push(`%${query[key]}%`);
    }
  }
  return { where, values };
}

function sendOk(res, mensagem, dados) {
  const arr = Array.isArray(dados) ? dados : (dados ? [dados] : []);
  res.status(200).json({ sucesso: true, mensagem, dados: arr, itens: arr.length });
}

function sendCreated(res, mensagem, dados) {
  res.status(201).json({ sucesso: true, mensagem, dados, itens: Array.isArray(dados) ? dados.length : 1 });
}

function sendNotFound(res, mensagem='Registro não encontrado.') {
  res.status(404).json({ sucesso: false, mensagem, dados: null, itens: 0 });
}

function sendBadRequest(res, mensagem) {
  res.status(400).json({ sucesso: false, mensagem, dados: null, itens: 0 });
}

function sendError(res, error) {
  res.status(500).json({ sucesso: false, mensagem: 'Erro na requisição.', dados: error.message, itens: 0 });
}
const bcrypt = require('bcrypt'); // Apostila 005 - criptografia de senha

module.exports = {
  // GET /usuarios
  async listarUsuarios(req, res) {
    try {
      const { page, limit, offset } = buildPagination(req.query);
      const { where, values } = pickFilters(req.query, ['usu_nome', 'usu_email']);
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const sql = `SELECT usu_id, usu_nome, usu_email, CAST(usu_ativo AS UNSIGNED) AS usu_ativo
                   FROM usuarios
                   ${whereSql}
                   ORDER BY usu_id DESC
                   LIMIT ? OFFSET ?`;
      const [rows] = await db.query(sql, [...values, limit, offset]);
      sendOk(res, 'Lista de usuários.', rows);
    } catch (error) {
      sendError(res, error);
    }
  },

  // POST /usuarios
  async cadastrarUsuarios(req, res) {
    try {
      const { usu_nome, usu_email, usu_senha } = req.body;
      if (!usu_nome || !usu_email || !usu_senha) return sendBadRequest(res, 'Nome, e-mail e senha são obrigatórios.');

      const [exists] = await db.query('SELECT usu_id FROM usuarios WHERE usu_email = ?', [usu_email]);
      if (exists.length) return sendBadRequest(res, 'E-mail já cadastrado.');

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(usu_senha, salt);

      const [result] = await db.query(
        'INSERT INTO usuarios (usu_nome, usu_email, usu_senha, usu_ativo) VALUES (?,?,?,1)',
        [usu_nome, usu_email, hash]
      );
      sendCreated(res, 'Usuário cadastrado.', { id: result.insertId });
    } catch (error) {
      sendError(res, error);
    }
  },

  // PATCH /usuarios/:id
  async editarUsuarios(req, res) {
    try {
      const { id } = req.params;
      const [check] = await db.query('SELECT usu_id FROM usuarios WHERE usu_id = ?', [id]);
      if (!check.length) return sendNotFound(res);

      const fields = [];
      const values = [];
      const allowed = ['usu_nome', 'usu_email'];

      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(req.body[key]);
        }
      }

      if (req.body.usu_senha) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.usu_senha, salt);
        fields.push('usu_senha = ?');
        values.push(hash);
      }

      if (!fields.length) return sendBadRequest(res, 'Nenhum campo para atualizar.');

      const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE usu_id = ?`;
      values.push(id);
      const [result] = await db.query(sql, values);
      sendOk(res, 'Usuário atualizado.', { id, linhas_afetadas: result.affectedRows });
    } catch (error) {
      sendError(res, error);
    }
  },

  // DELETE /usuarios/:id
  async apagarUsuarios(req, res) {
    try {
      const { id } = req.params;
      const [check] = await db.query('SELECT usu_id FROM usuarios WHERE usu_id = ?', [id]);
      if (!check.length) return sendNotFound(res);

      try {
        const [r] = await db.query('DELETE FROM usuarios WHERE usu_id = ?', [id]);
        if (!r.affectedRows) return sendNotFound(res);
        sendOk(res, 'Usuário excluído.', { id });
      } catch (e) {
        return sendBadRequest(res, 'Não é possível excluir: há relacionamentos. Considere exclusão lógica (usu_ativo=0).');
      }
    } catch (error) {
      sendError(res, error);
    }
  },

  // POST /login
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) return sendBadRequest(res, 'E-mail e senha são obrigatórios.');

      const [rows] = await db.query(
        'SELECT usu_id, usu_nome, usu_email, usu_senha, CAST(usu_ativo AS UNSIGNED) AS usu_ativo FROM usuarios WHERE usu_email = ? LIMIT 1',
        [email]
      );
      if (!rows.length) return sendBadRequest(res, 'Credenciais inválidas.');

      const user = rows[0];
      const confere = await bcrypt.compare(senha, user.usu_senha);
      if (!confere) return sendBadRequest(res, 'Credenciais inválidas.');

      delete user.usu_senha;
      sendOk(res, 'Login efetuado.', user);
    } catch (error) {
      sendError(res, error);
    }
  }
};
