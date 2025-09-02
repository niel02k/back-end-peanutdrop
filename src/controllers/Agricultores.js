const db = require('../dataBase/connection');

module.exports = {
  // GET /agricultores
  async listarAgricultores(request, response) {
    try {
      const sql = `
        SELECT
          agri_id,
          agri_localizacao_propriedade,
          agri_tipos_amendoim_cultivados,
          agri_certificacoes,
          agri_outras_informacoes
        FROM AGRICULTORES;
      `;
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Agricultores',
        nRegistros: rows.length,
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

  // POST /agricultores
  async cadastrarAgricultores(request, response) {
    try {
      const {
        agri_localizacao_propriedade,
        agri_tipos_amendoim_cultivados,
        agri_certificacoes,
        agri_outras_informacoes
      } = request.body;

      // (validações simples opcionais)
      // if (!agri_localizacao_propriedade) { ... }

      const sql = `
        INSERT INTO AGRICULTORES (
          agri_localizacao_propriedade,
          agri_tipos_amendoim_cultivados,
          agri_certificacoes,
          agri_outras_informacoes
        )
        VALUES (?, ?, ?, ?)
      `;
      const values = [
        agri_localizacao_propriedade,
        agri_tipos_amendoim_cultivados,
        agri_certificacoes,
        agri_outras_informacoes
      ];

      const [result] = await db.query(sql, values);

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Agricultor cadastrado com sucesso.',
        dados: {
          agri_id: result.insertId,
          agri_localizacao_propriedade,
          agri_tipos_amendoim_cultivados,
          agri_certificacoes,
          agri_outras_informacoes
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

  // PATCH /agricultores/:id — UPDATE dinâmico com retorno do diff
  async editarAgricultores(request, response) {
    try {
      const { id } = request.params;
      const payload = request.body || {};

      // carrega estado atual
      const [rows] = await db.query(`
        SELECT
          agri_id,
          agri_localizacao_propriedade,
          agri_tipos_amendoim_cultivados,
          agri_certificacoes,
          agri_outras_informacoes
        FROM AGRICULTORES
        WHERE agri_id = ?
      `, [id]);

      if (!rows.length) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Agricultor ${id} não encontrado.`,
          dados: null
        });
      }
      const atual = rows[0];

      // whitelist de campos editáveis
      const permitidos = new Set([
        'agri_localizacao_propriedade',
        'agri_tipos_amendoim_cultivados',
        'agri_certificacoes',
        'agri_outras_informacoes'
      ]);

      // monta diff real
      const sets = [];
      const values = [];
      const alteracoes = [];

      for (const [k, v] of Object.entries(payload)) {
        if (!permitidos.has(k) || v === undefined) continue;

        const antigo = atual[k];
        const novo = v;

        // compara por string simples (ajuste se quiser normalizar)
        if (String(antigo ?? '') !== String(novo ?? '')) {
          sets.push(`${k} = ?`);
          values.push(novo);
          alteracoes.push({ campo: k, de: antigo, para: novo });
        }
      }

      if (!sets.length) {
        return response.status(200).json({
          sucesso: true,
          mensagem: `Nenhuma alteração aplicada no agricultor ${id}.`,
          agri_id: Number(id),
          alteracoes: []
        });
      }

      const sql = `UPDATE AGRICULTORES SET ${sets.join(', ')} WHERE agri_id = ?`;
      values.push(id);
      const [result] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Agricultor ${id} atualizado com sucesso.`,
        agri_id: Number(id),
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

  // DELETE /agricultores/:id
  async apagarAgricultores(request, response) {
    try {
      const { id } = request.params;
      const sql = `DELETE FROM AGRICULTORES WHERE agri_id = ?`;
      const [result] = await db.query(sql, [id]);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Agricultor ${id} não encontrado!`,
          dados: null
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Agricultor ${id} excluído com sucesso`,
        dados: null
      });
    } catch (error) {
      const code = String(error.code || '');
      if (code.includes('ER_ROW_IS_REFERENCED') || code.includes('ER_NO_REFERENCED_ROW')) {
        return response.status(409).json({
          sucesso: false,
          mensagem: 'Não foi possível excluir por existir relacionamento (FK). Considere armazenar apenas a atualização via PATCH.',
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
