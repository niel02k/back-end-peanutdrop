const db = require('../dataBase/connection'); 

module.exports = {
    // Listagem de pagamentos
    // Retorna todos os pagamentos cadastrados
    async listarPagamentos(request, response) {
        try {
            const sql =`
           SELECT 
           pag_id, 
           contrato_id, 
           pag_valor, 
           pag_data_pagamento
           FROM PAGAMENTOS
          
            `;

            const [rows] = await db.query(sql);
            
            const nRegistros = rows.length;


            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Pagamentos', 
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
    // Cadastro de pagamento
    // Insere um novo pagamento no banco de dados
    async cadastrarPagamentos(request, response) {
        try {

            const { contrato_id, pag_valor, pag_data_pagamento, pag_status } = request.body;
            
            // Instrução SQL
            const sql = `
              INSERT INTO PAGAMENTOS (contrato_id,
               pag_valor,
                pag_data_pagamento,
                pag_status) VALUES
                 (?,?,?,?)
                    `;

                    const values = [contrato_id, pag_valor, pag_data_pagamento, pag_status];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        contrato_id: result.insertId,
                        pag_valor, 
                        pag_data_pagamento, 
                        pag_status
                    };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de pagamentos', 
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
    // Atualização de pagamento
    // Atualiza dados do pagamento
    // Retorna erro 404 se pagamento não encontrado
    async editarPagamentos(request, response) {
        try {
            const { contrato_id, pag_valor, pag_data_pagamento, pag_status } = request.body;
            const { id } = request.params;
    
            const sql = `
                UPDATE PAGAMENTOS SET
                    contrato_id =?, pag_valor =?, pag_data_pagamento =?, pag_status=?
                WHERE
                    pag_id = ?;
            `;
    
            const values = [contrato_id, pag_valor, pag_data_pagamento, pag_status, id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Contrato com ID ${id} não encontrado!`,
                    dados: null
                });
            }
    
            const dados = {
                contrato_id, 
                pag_valor, 
                pag_data_pagamento, 
                pag_status
            };
    
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Contrato atualizado com sucesso!',
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
    async apagarPagamentos(request, response) {
        try {
            const ativo = false;
            const { id } = request.params;
            const sql = `UPDATE pagamentos SET
             pag_ativo = ? 
             WHERE pag_id = ?;
             `;
           const values = [ativo, id];
s
           const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
        return res.status(404).json({
            sucesso: false,
            mensagem: `pagamento ${pag_id} não encontrado!`,
            dados: null
        });

    }
            return response.status(200).json({
                sucesso: true, 
                mensagem: `pagamento ${id} excluido com sucesso.`, 
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

     async listarPagamentosFiltro(req, res) {
    try {
      const {
        contrato_id,          // igualdade
        pag_status,           // igualdade
        min_valor, max_valor, // faixa numérica
        de_data, ate_data     // faixa por data de pagamento
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (contrato_id && !isNaN(contrato_id)) {
        where.push('p.contrato_id = ?');
        values.push(Number(contrato_id));
      }
      if (pag_status !== undefined && String(pag_status).trim() !== '') {
        where.push('p.pag_status = ?');
        values.push(pag_status);
      }
      if (min_valor && !isNaN(min_valor)) {
        where.push('p.pag_valor >= ?');
        values.push(Number(min_valor));
      }
      if (max_valor && !isNaN(max_valor)) {
        where.push('p.pag_valor <= ?');
        values.push(Number(max_valor));
      }
      if (de_data && de_data.trim() !== '') {
        where.push('p.pag_data_pagamento >= ?');
        values.push(de_data);
      }
      if (ate_data && ate_data.trim() !== '') {
        where.push('p.pag_data_pagamento <= ?');
        values.push(ate_data);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  p.pag_id, ' +
        '  p.contrato_id, ' +
        '  p.pag_valor, ' +
        '  p.pag_data_pagamento, ' +
        '  p.pag_status ' +
        'FROM PAGAMENTOS p ' +
        whereSql +
        ' ORDER BY p.pag_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM PAGAMENTOS p ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de pagamentos (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar pagamentos',
        dados: error.message
      });
    }
  }
};