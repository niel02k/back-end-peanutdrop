const db = require('../dataBase/connection'); 

module.exports = {
  async listarNotas_fiscais(request, response) {
    try {
      const sql =`
        SELECT
          nota_fiscal_id, 
          contrato_id, 
          nota_fiscal_numero, 
          nota_fiscal_data_emissao, 
          nota_fiscal_detalhes
        FROM NOTAS_FISCAIS
      `;
      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      return response.status(200).json({
        sucesso: true, 
        mensagem: 'Lista de notas_fiscais', 
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

  async cadastrarNotas_fiscais(request, response) {
    try {
      const { contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes } = request.body;
      const sql = `
        INSERT INTO NOTAS_FISCAIS (
          contrato_id,
          nota_fiscal_numero,
          nota_fiscal_data_emissao,
          nota_fiscal_detalhes
        ) VALUES (?,?,?,?)
      `;
      const values = [contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes];
      const [result] = await db.query(sql, values);

      const dados = {
        nota_fiscal_id: result.insertId,
        contrato_id, 
        nota_fiscal_numero, 
        nota_fiscal_data_emissao, 
        nota_fiscal_detalhes
      };

      return response.status(201).json({
        sucesso: true, 
        mensagem: 'Cadastro de nota fiscal', 
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

  async editarNotas_fiscais(request, response) {
    try {
      const { contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes } = request.body;
      const { id } = request.params;

      const sql = `
        UPDATE NOTAS_FISCAIS SET
          contrato_id = ?,
          nota_fiscal_numero = ?,
          nota_fiscal_data_emissao = ?,
          nota_fiscal_detalhes = ?
        WHERE
          nota_fiscal_id = ?
      `;
      const values = [contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes, id];
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Nota fiscal ${id} não encontrada!`,
          dados: null
        });
      }

      const dados = { contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes };
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Nota fiscal atualizada com sucesso!',
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

  async apagarNotas_fiscais(request, response) {
    try {
      const { id } = request.params;
      // Exclusão definitiva (ajuste para soft delete se desejar)
      const sql = `DELETE FROM NOTAS_FISCAIS WHERE nota_fiscal_id = ?`;
      const [result] = await db.query(sql, [id]);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Nota fiscal ${id} não encontrada!`,
          dados: null
        });
      }

      return response.status(200).json({
        sucesso: true, 
        mensagem: `Nota fiscal ${id} excluída com sucesso.`, 
        dados: null
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false, 
        mensagem: 'Erro na requisição.', 
        dados: error.message
      });
    }
  },

  // >>> NOVO: Listagem com filtros + paginação + total (Apostila 004)
  async listarNotas_fiscaisFiltro(req, res) {
    try {
      const { nota_fiscal_numero, de_data, ate_data, contrato_id } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (nota_fiscal_numero && nota_fiscal_numero.trim() !== '') {
        where.push('nf.nota_fiscal_numero LIKE ?');
        values.push(`%${nota_fiscal_numero}%`);
      }
      if (de_data && de_data.trim() !== '') {
        where.push('nf.nota_fiscal_data_emissao >= ?');
        values.push(de_data);
      }
      if (ate_data && ate_data.trim() !== '') {
        where.push('nf.nota_fiscal_data_emissao <= ?');
        values.push(ate_data);
      }
      if (contrato_id && String(contrato_id).trim() !== '') {
        where.push('nf.contrato_id = ?');
        values.push(Number(contrato_id));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  nf.nota_fiscal_id          AS id, ' +
        '  nf.contrato_id             AS contrato_id, ' +
        '  nf.nota_fiscal_numero      AS numero, ' +
        '  nf.nota_fiscal_data_emissao AS data_emissao, ' +
        '  nf.nota_fiscal_detalhes    AS detalhes ' +
        'FROM NOTAS_FISCAIS nf ' +
        whereSql +
        ' ORDER BY nf.nota_fiscal_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM NOTAS_FISCAIS nf ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de notas_fiscais (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar notas_fiscais',
        dados: error.message
      });
    }
  }
};
