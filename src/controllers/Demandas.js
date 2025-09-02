const db = require('../dataBase/connection');

// utils simples
const isNum = (v) => v !== null && v !== '' && !Number.isNaN(Number(v));
const isNumPos = (v) => isNum(v) && Number(v) >= 0;
const isDate = (s) => !s || !Number.isNaN(Date.parse(s));

module.exports = {
  // GET /demandas
  async listarDemandas(request, response) {
    try {
      const sql = `
        SELECT
          demanda_id,
          emp_id,
          amen_id,
          demanda_quantidade,
          demanda_preco_maximo,
          demanda_data_entrega,
          demanda_outras_informacoes,
          demanda_data_publicacao,
          CAST(demanda_ativa AS UNSIGNED) AS demanda_ativa
        FROM DEMANDAS;
      `;
      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Demandas',
        resultado: nRegistros,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  // POST /demandas
  async cadastrarDemandas(request, response) {
    try {
      // nomes curtos aceitos e mapeados para colunas
      let {
        emp_id,
        amen_id,
        quantidade,          // -> demanda_quantidade
        preco_maximo,        // -> demanda_preco_maximo
        data_entrega,        // -> demanda_data_entrega
        informacoes,         // -> demanda_outras_informacoes
        data_publi,          // -> demanda_data_publicacao
        ativa                // -> demanda_ativa
      } = request.body;

      // validações mínimas
      if (!emp_id || !amen_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'emp_id e amen_id são obrigatórios.' });
      }
      if (!isNumPos(quantidade)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_quantidade deve ser número >= 0.' });
      }
      if (!isNumPos(preco_maximo)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_preco_maximo deve ser número >= 0.' });
      }
      if (data_entrega && !isDate(data_entrega)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_data_entrega inválida.' });
      }
      if (data_publi && !isDate(data_publi)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_data_publicacao inválida.' });
      }
      if (ativa !== undefined && ![0,1,'0','1',true,false].includes(ativa)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_ativa deve ser 0/1 (ou booleano).' });
      }

      // defaults
      if (data_publi == null || data_publi === '') data_publi = null; // NOW() no SQL
      if (ativa == null) ativa = 1;

      const sql = `
        INSERT INTO DEMANDAS
          (emp_id, amen_id, demanda_quantidade, demanda_preco_maximo,
           demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa)
        VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?)
      `;
      const values = [
        emp_id, amen_id,
        quantidade, preco_maximo,
        data_entrega, informacoes,
        data_publi, ativa
      ];

      const [result] = await db.query(sql, values);

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Demanda cadastrada com sucesso.',
        dados: {
          demanda_id: result.insertId,
          emp_id,
          amen_id,
          demanda_quantidade: quantidade,
          demanda_preco_maximo: preco_maximo,
          demanda_data_entrega: data_entrega,
          demanda_outras_informacoes: informacoes,
          demanda_data_publicacao: data_publi || new Date().toISOString(),
          demanda_ativa: Number(ativa)
        }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  // PATCH /demandas/:id — update dinâmico + retorno do diff
  async editarDemandas(request, response) {
    try {
      const { id } = request.params;

      // Aceita tanto nomes curtos quanto nomes de coluna
      const payloadOriginal = request.body || {};
      const payload = { ...payloadOriginal };

      // Mapear nomes curtos -> colunas reais (sem sobrescrever se já vieram certos)
      const map = {
        quantidade: 'demanda_quantidade',
        preco_maximo: 'demanda_preco_maximo',
        data_entrega: 'demanda_data_entrega',
        informacoes: 'demanda_outras_informacoes',
        data_publi: 'demanda_data_publicacao',
        ativa: 'demanda_ativa'
      };
      for (const [curto, coluna] of Object.entries(map)) {
        if (payload[curto] !== undefined && payload[coluna] === undefined) {
          payload[coluna] = payload[curto];
          delete payload[curto];
        }
      }

      // Buscar estado atual
      const [rows] = await db.query(`
        SELECT
          demanda_id,
          emp_id,
          amen_id,
          demanda_quantidade,
          demanda_preco_maximo,
          demanda_data_entrega,
          demanda_outras_informacoes,
          demanda_data_publicacao,
          CAST(demanda_ativa AS UNSIGNED) AS demanda_ativa
        FROM DEMANDAS
        WHERE demanda_id = ?
      `, [id]);

      if (!rows.length) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Demanda ${id} não encontrada.`,
          dados: null
        });
      }
      const atual = rows[0];

      // Whitelist de campos editáveis
      const permitidos = new Set([
        'emp_id',
        'amen_id',
        'demanda_quantidade',
        'demanda_preco_maximo',
        'demanda_data_entrega',
        'demanda_outras_informacoes',
        'demanda_data_publicacao',
        'demanda_ativa'
      ]);

      // Validações pontuais
      if (payload.demanda_quantidade !== undefined && !isNumPos(payload.demanda_quantidade)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_quantidade deve ser número >= 0.' });
      }
      if (payload.demanda_preco_maximo !== undefined && !isNumPos(payload.demanda_preco_maximo)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_preco_maximo deve ser número >= 0.' });
      }
      if (payload.demanda_data_entrega && !isDate(payload.demanda_data_entrega)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_data_entrega inválida.' });
      }
      if (payload.demanda_data_publicacao && !isDate(payload.demanda_data_publicacao)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_data_publicacao inválida.' });
      }
      if (payload.demanda_ativa !== undefined && ![0,1,'0','1',true,false].includes(payload.demanda_ativa)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_ativa deve ser 0/1 (ou booleano).' });
      }

      // Diff real (apenas o que mudou)
      const normaliza = (campo, val) => {
        if (val === null || val === undefined) return val;
        if (['demanda_quantidade','demanda_preco_maximo','emp_id','amen_id'].includes(campo)) return Number(val);
        if (campo === 'demanda_ativa') return Number(val);
        if (['demanda_data_entrega','demanda_data_publicacao'].includes(campo)) {
          try { return new Date(val).toISOString().slice(0,10); } catch { return String(val); }
        }
        return String(val);
      };

      const sets = [];
      const values = [];
      const alteracoes = [];

      for (const [k, v] of Object.entries(payload)) {
        if (!permitidos.has(k) || v === undefined) continue;
        const novo = normaliza(k, v);
        const antigo = normaliza(k, atual[k]);
        if (novo !== antigo) {
          sets.push(`${k} = ?`);
          values.push(v);
          alteracoes.push({ campo: k, de: atual[k], para: v });
        }
      }

      if (!sets.length) {
        return response.status(200).json({
          sucesso: true,
          mensagem: `Nenhuma alteração aplicada na demanda ${id}.`,
          demanda_id: Number(id),
          alteracoes: []
        });
      }

      const sql = `UPDATE DEMANDAS SET ${sets.join(', ')} WHERE demanda_id = ?`;
      values.push(id);
      const [result] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Demanda ${id} atualizada com sucesso.`,
        demanda_id: Number(id),
        alteracoes,
        linhas_afetadas: result.affectedRows,
        campos_alterados: sets.length
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  // DELETE /demandas/:id
  async apagarDemandas(request, response) {
    try {
      const { id } = request.params;
      const sql = `DELETE FROM DEMANDAS WHERE demanda_id = ?`;
      const [result] = await db.query(sql, [id]);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Demanda ${id} não encontrada`,
          dados: null
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Demanda ${id} excluída com sucesso`,
        dados: null
      });
    } catch (error) {
      // Tratamento de FK (se houver)
      const code = String(error.code || '');
      if (code.includes('ER_ROW_IS_REFERENCED') || code.includes('ER_NO_REFERENCED_ROW')) {
        return response.status(409).json({
          sucesso: false,
          mensagem: 'Não foi possível excluir a demanda por existir relacionamento (FK). Considere inativar: demanda_ativa = 0.',
          dados: error.message
        });
      }
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  }
};
