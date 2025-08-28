const db = require('../dataBase/connection');

// helpers simples
const isNum = (v) => v !== null && v !== '' && !Number.isNaN(Number(v));
const isNumPos = (v) => isNum(v) && Number(v) >= 0;
const isDate = (s) => !s || !Number.isNaN(Date.parse(s)); // aceita vazio (sem alteração)

module.exports = {
  async listarOfertas(request, response) {
    try {
      // CAST em BIT -> UNSIGNED para evitar Buffer no JSON
      const sql = `
        SELECT 
          oferta_id, 
          agri_id, 
          amen_id, 
          oferta_quantidade, 
          oferta_preco, 
          oferta_data_colheita, 
          oferta_outras_informacoes, 
          oferta_data_publicacao, 
          CAST(oferta_ativa AS UNSIGNED) AS oferta_ativa
        FROM OFERTAS;
      `;
      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Ofertas',
        nRegistros,
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

  async cadastrarOfertas(request, response) {
    try {
      let {
        agri_id,
        amen_id,
        oferta_quantidade,
        oferta_preco,
        oferta_data_colheita,
        oferta_outras_informacoes,
        oferta_data_publicacao,
        oferta_ativa
      } = request.body;

      // validações mínimas
      if (!agri_id || !amen_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'agri_id e amen_id são obrigatórios.' });
      }
      if (!isNumPos(oferta_quantidade)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_quantidade deve ser número >= 0.' });
      }
      if (!isNumPos(oferta_preco)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_preco deve ser número >= 0.' });
      }
      if (oferta_data_colheita && !isDate(oferta_data_colheita)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_data_colheita inválida.' });
      }
      if (oferta_data_publicacao && !isDate(oferta_data_publicacao)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_data_publicacao inválida.' });
      }

      // defaults
      if (oferta_data_publicacao == null || oferta_data_publicacao === '') {
        oferta_data_publicacao = null; // deixa NOW() no SQL
      }
      if (oferta_ativa == null) {
        oferta_ativa = 1; // ativa por padrão
      }

      const sql = `
        INSERT INTO OFERTAS (
          agri_id, amen_id, 
          oferta_quantidade, oferta_preco, oferta_data_colheita, 
          oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa
        ) VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?)
      `;
      const values = [
        agri_id, amen_id,
        oferta_quantidade, oferta_preco, oferta_data_colheita,
        oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa
      ];
      const [result] = await db.query(sql, values);

      const dados = {
        oferta_id: result.insertId,
        agri_id,
        amen_id,
        oferta_quantidade,
        oferta_preco,
        oferta_data_colheita,
        oferta_outras_informacoes,
        oferta_data_publicacao: oferta_data_publicacao || new Date().toISOString(),
        oferta_ativa
      };

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Oferta cadastrada com sucesso.',
        dados
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  // UPDATE DINÂMICO (PATCH): só altera os campos enviados no body
  async editarOfertas(request, response) {
    try {
      const { id } = request.params;
      const payload = request.body || {};

      // confere existência
      const [exist] = await db.query(
        'SELECT oferta_id, CAST(oferta_ativa AS UNSIGNED) AS oferta_ativa FROM OFERTAS WHERE oferta_id = ?',
        [id]
      );
      if (!exist.length) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Oferta ${id} não encontrada.`,
          dados: null
        });
      }

      // whitelist de campos editáveis
      const permitidos = new Set([
        'agri_id',
        'amen_id',
        'oferta_quantidade',
        'oferta_preco',
        'oferta_data_colheita',
        'oferta_outras_informacoes',
        'oferta_data_publicacao',
        'oferta_ativa'
      ]);

      const sets = [];
      const values = [];

      // validações por campo
      if (payload.oferta_quantidade !== undefined && !isNumPos(payload.oferta_quantidade)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_quantidade deve ser número >= 0.' });
      }
      if (payload.oferta_preco !== undefined && !isNumPos(payload.oferta_preco)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_preco deve ser número >= 0.' });
      }
      if (payload.oferta_data_colheita && !isDate(payload.oferta_data_colheita)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_data_colheita inválida.' });
      }
      if (payload.oferta_data_publicacao && !isDate(payload.oferta_data_publicacao)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_data_publicacao inválida.' });
      }
      if (payload.oferta_ativa !== undefined && ![0, 1, '0', '1', true, false].includes(payload.oferta_ativa)) {
        return response.status(422).json({ sucesso: false, mensagem: 'oferta_ativa deve ser 0/1 (ou booleano).' });
      }

      for (const [k, v] of Object.entries(payload)) {
        if (permitidos.has(k) && v !== undefined) {
          sets.push(`${k} = ?`);
          values.push(v);
        }
      }

      if (!sets.length) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum campo válido para atualizar.',
          dados: null
        });
      }

      // ⚠️ sem updated_at/updated_by (sua tabela não tem)
      const sql = `UPDATE OFERTAS SET ${sets.join(', ')} WHERE oferta_id = ?`;
      values.push(id);

      const [result] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: `Oferta ${id} atualizada com sucesso.`,
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

  async apagarOfertas(request, response) {
    try {
      const { id } = request.params;

      const sql = `DELETE FROM OFERTAS WHERE oferta_id = ?`;
      const [result] = await db.query(sql, [id]);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Oferta ${id} não encontrada.`,
          dados: null
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Oferta ${id} excluída com sucesso`,
        dados: null
      });
    } catch (error) {
      // Caso tenha FK impedindo exclusão, retorne 409 para o front decidir soft-delete
      const code = String(error.code || '');
      if (code.includes('ER_ROW_IS_REFERENCED') || code.includes('ER_NO_REFERENCED_ROW')) {
        return response.status(409).json({
          sucesso: false,
          mensagem: 'Não foi possível excluir a oferta por existir relacionamento (FK). Considere inativar: oferta_ativa = 0.',
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
