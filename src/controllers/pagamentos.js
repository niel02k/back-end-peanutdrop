const db = require('../dataBase/connection'); 

module.exports = {
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
      // 1) Lê filtros e paginação
      const {
        pag_status,
        pag_metodo,
        min_valor,
        max_valor,
        de_data,
        ate_data,
        contrato_numero,
        nf_numero
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      // 2) WHERE dinâmico e parâmetros
      const where = [];
      const values = [];

      if (pag_status && pag_status.trim() !== '') {
        where.push('p.pag_status LIKE ?');
        values.push(`%${pag_status}%`);
      }

      if (pag_metodo && pag_metodo.trim() !== '') {
        where.push('p.pag_metodo LIKE ?');
        values.push(`%${pag_metodo}%`);
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
        where.push('p.pag_data >= ?');
        values.push(de_data);
      }

      if (ate_data && ate_data.trim() !== '') {
        where.push('p.pag_data <= ?');
        values.push(ate_data);
      }

      if (contrato_numero && contrato_numero.trim() !== '') {
        where.push('c.con_numero LIKE ?');
        values.push(`%${contrato_numero}%`);
      }

      if (nf_numero && nf_numero.trim() !== '') {
        where.push('nf.nf_numero LIKE ?');
        values.push(`%${nf_numero}%`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      // 3) SELECT com JOINs + CAST de BIT + paginação
      const selectSql =
        'SELECT ' +
        '  p.pag_id          AS id, ' +
        '  p.pag_status      AS status, ' +
        '  p.pag_metodo      AS metodo, ' +
        '  p.pag_valor       AS valor, ' +
        '  p.pag_data        AS data, ' +
        '  (p.pag_confirmado + 0) AS confirmado, ' + // CAST BIT -> 0/1
        '  p.con_id          AS contrato_id, ' +
        '  c.con_numero      AS contrato_numero, ' +
        '  p.nf_id           AS nota_id, ' +
        '  nf.nf_numero      AS nf_numero ' +
        'FROM PAGAMENTO p ' +                 // ajuste: PAGAMENTO vs pagamentos
        'LEFT JOIN CONTRATO c ON c.con_id = p.con_id ' +
        'LEFT JOIN NOTA_FISCAL nf ON nf.nf_id = p.nf_id ' +
        whereSql +
        ' ORDER BY p.pag_id DESC ' +
        'LIMIT ? OFFSET ?';

      // 4) COUNT com mesmos filtros
      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM PAGAMENTO p ' +
        'LEFT JOIN CONTRATO c ON c.con_id = p.con_id ' +
        'LEFT JOIN NOTA_FISCAL nf ON nf.nf_id = p.nf_id ' +
        whereSql;

      // 5) Executa
      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      // 6) Resposta padrão
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de pagamentos',
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