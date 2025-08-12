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
module.exports = {
  // GET /agrCertificacoes
  async listarAgrcertificacoes(req, res) {
    try {
      const { page, limit, offset } = buildPagination(req.query);
      const { where, values } = pickFilters(req.query, ["agc_status"]);
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const sql = `SELECT *, CAST(agc_ativo AS UNSIGNED) AS agc_ativo
                   FROM agr_certificacoes
                   ${whereSql}
                   ORDER BY agc_id DESC
                   LIMIT ? OFFSET ?`;
      const [rows] = await db.query(sql, [...values, limit, offset]);
      sendOk(res, 'Lista de agrCertificacoes.', rows);
    } catch (error) {
      sendError(res, error);
    }
  },

  // POST /agrCertificacoes
  async cadastrarAgrcertificacoes(req, res) {
    try {
      const data = req.body;
      if (!data || !Object.keys(data).length) return sendBadRequest(res, 'Payload vazio.');
      const cols = Object.keys(data);
      const vals = Object.values(data);
      const qMarks = cols.map(() => '?').join(', ');
      const sql = `INSERT INTO agr_certificacoes (${cols.join(', ')}) VALUES (${qMarks})`;
      const [result] = await db.query(sql, vals);
      sendCreated(res, 'Agrcertificacoes cadastrado(a).', { id: result.insertId });
    } catch (error) {
      sendError(res, error);
    }
  },

  // PATCH /agrCertificacoes/:id
  async editarAgrcertificacoes(req, res) {
    try {
      const { id } = req.params;
      const [check] = await db.query('SELECT agc_id FROM agr_certificacoes WHERE agc_id = ?', [id]);
      if (!check.length) return sendNotFound(res);

      const data = req.body || {};
      const fields = [];
      const values = [];
      for (const [k,v] of Object.entries(data)) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
      if (!fields.length) return sendBadRequest(res, 'Nenhum campo para atualizar.');

      const sql = `UPDATE agr_certificacoes SET ${fields.join(', ')} WHERE agc_id = ?`;
      values.push(id);
      const [result] = await db.query(sql, values);
      sendOk(res, 'Agrcertificacoes atualizado(a).', { id, linhas_afetadas: result.affectedRows });
    } catch (error) {
      sendError(res, error);
    }
  },

  // DELETE /agrCertificacoes/:id
  async apagarAgrcertificacoes(req, res) {
    try {
      const { id } = req.params;
      const [check] = await db.query('SELECT agc_id FROM agr_certificacoes WHERE agc_id = ?', [id]);
      if (!check.length) return sendNotFound(res);
      try {
        const [r] = await db.query('DELETE FROM agr_certificacoes WHERE agc_id = ?', [id]);
        if (!r.affectedRows) return sendNotFound(res);
        sendOk(res, 'Agrcertificacoes excluído(a).', { id });
      } catch (e) {
        return sendBadRequest(res, 'Não é possível excluir: há relacionamentos. Considere exclusão lógica com campo *_ativo.');
      }
    } catch (error) {
      sendError(res, error);
    }
  },

  ,// PATCH /agrCertificacoes/:id  - Atualiza **apenas atributos**; não troque o vínculo N:N aqui.
  async editarAgrCertAtributos(req, res) {
    try {
      const { id } = req.params;
      const [check] = await db.query('SELECT agc_id FROM agr_certificacoes WHERE agc_id = ?', [id]);
      if (!check.length) return sendNotFound(res);

      const data = req.body || {};
      const fields = [];
      const values = [];
      const allowed = ['agc_data_validade', 'agc_observacao', 'agc_status'];
      for (const k of allowed) {
        if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
      }
      if (!fields.length) return sendBadRequest(res, 'Nenhum atributo permitido para atualizar.');

      const sql = `UPDATE agr_certificacoes SET ${fields.join(', ')} WHERE agc_id = ?`;
      values.push(id);
      const [result] = await db.query(sql, values);
      sendOk(res, 'Atributos do vínculo atualizados.', { id, linhas_afetadas: result.affectedRows });
    } catch (error) {
      sendError(res, error);
    }
  },

  // POST /agrCertificacoes/trocar-vinculo  - remove vínculo antigo e cria novo (N:N)
  async trocarVinculo(req, res) {
    const conn = await db.getConnection();
    try {
      const { agc_id, novo_agr_id, nova_cer_id } = req.body;
      if (!agc_id || !novo_agr_id || !nova_cer_id) return sendBadRequest(res, 'Campos obrigatórios: agc_id, novo_agr_id, nova_cer_id.');

      await conn.beginTransaction();
      const [check] = await conn.query('SELECT agc_id FROM agr_certificacoes WHERE agc_id = ?', [agc_id]);
      if (!check.length) { await conn.rollback(); return sendNotFound(res); }

      await conn.query('DELETE FROM agr_certificacoes WHERE agc_id = ?', [agc_id]);
      const [ins] = await conn.query('INSERT INTO agr_certificacoes (agc_agr_id, agc_cer_id, agc_status) VALUES (?,?,?)',
        [novo_agr_id, nova_cer_id, 'ativo']);
      await conn.commit();
      sendCreated(res, 'Vínculo trocado com sucesso.', { id: ins.insertId });
    } catch (error) {
      try { await conn.rollback(); } catch (e) {}
      sendError(res, error);
    } finally {
      conn.release();
    }
  }

};
