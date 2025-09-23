const db = require('../dataBase/connection'); 

module.exports = {
    async listarPropostas(request, response) {
        try {

            const sql = `
            SELECT
                prop_id, negoc_id, emp_id, prop_preco, 
                prop_quantidade, prop_data_envio, prop_status 
            FROM PROPOSTA;
                        `;
            
            const [rows] = await db.query(sql);

            const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Propostas', 
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
    async cadastrarPropostas(request, response) {
        try {

            const {negoc_id, emp_id, preco, quantidade, data_envio, status} = request.body;

            //instruções sql
            const sql = `
                INSERT INTO PROPOSTA
                    (negoc_id, emp_id, prop_preco, prop_quantidade, prop_data_envio, prop_status) 
                VALUES
                    (?, ?, ? ,? ,?, ?);
            `;

            const values = [negoc_id, emp_id, preco, quantidade, data_envio, status];
            
            const [result] = await db.query(sql, values);

            const dados= {
                negoc_id, 
                emp_id, 
                preco, 
                quantidade, 
                data_envio, 
                status
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Propostas', 
                dados: dados
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na requisição.', 
                dados: error.message
            });
        }
    }, 
    async editarPropostas(request, response) {
        try {
            const id = request.params.id;
    
            const { negoc_id, emp_id, preco, quantidade, data_envio, status } = request.body;
    
            const sql = `
                UPDATE PROPOSTA
                SET
                    negoc_id = ?,
                    emp_id = ?,
                    prop_preco = ?,
                    prop_quantidade = ?,
                    prop_data_envio = ?,
                    prop_status = ?
                WHERE
                    prop_id = ?
            `;
    
            const dados = [negoc_id, emp_id, preco, quantidade, data_envio, status, id];
    
            const [result] = await db.query(sql, dados);
    
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Alteração no cadastro de Propostas',
                dados: result
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async apagarPropostas(request, response) {
        try {
            const { id } = request.params;
    
            const sql = `DELETE FROM proposta WHERE prop_id = ?`;
    
            const values = [id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Proposta ${id} não encontrada`,
                });
            }
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Proposta ${id} excluída com sucesso`,
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

     async listarPropostasFiltro(req, res) {
    try {
      // filtros suportados
      const {
        negoc_id,        // igualdade
        emp_id,          // igualdade
        prop_status,     // igualdade ou LIKE se preferir
        min_preco,       // faixa
        max_preco,
        min_qtd,
        max_qtd,
        de_envio,        // faixa de data
        ate_envio
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (negoc_id && !isNaN(negoc_id)) {
        where.push('p.negoc_id = ?');
        values.push(Number(negoc_id));
      }
      if (emp_id && !isNaN(emp_id)) {
        where.push('p.emp_id = ?');
        values.push(Number(emp_id));
      }
      if (prop_status !== undefined && String(prop_status).trim() !== '') {
        where.push('p.prop_status = ?'); // troque para LIKE se quiser texto parcial
        values.push(prop_status);
      }
      if (min_preco && !isNaN(min_preco)) {
        where.push('p.prop_preco >= ?');
        values.push(Number(min_preco));
      }
      if (max_preco && !isNaN(max_preco)) {
        where.push('p.prop_preco <= ?');
        values.push(Number(max_preco));
      }
      if (min_qtd && !isNaN(min_qtd)) {
        where.push('p.prop_quantidade >= ?');
        values.push(Number(min_qtd));
      }
      if (max_qtd && !isNaN(max_qtd)) {
        where.push('p.prop_quantidade <= ?');
        values.push(Number(max_qtd));
      }
      if (de_envio && de_envio.trim() !== '') {
        where.push('p.prop_data_envio >= ?');
        values.push(de_envio);
      }
      if (ate_envio && ate_envio.trim() !== '') {
        where.push('p.prop_data_envio <= ?');
        values.push(ate_envio);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  p.prop_id, ' +
        '  p.negoc_id, ' +
        '  p.emp_id, ' +
        '  p.prop_preco, ' +
        '  p.prop_quantidade, ' +
        '  p.prop_data_envio, ' +
        '  p.prop_status ' +
        'FROM PROPOSTA p ' +
        whereSql +
        ' ORDER BY p.prop_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM PROPOSTA p ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de propostas (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar propostas',
        dados: error.message
      });
    }
  }
};