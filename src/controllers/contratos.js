const db = require('../dataBase/connection'); 

module.exports = {
    async listarContratos(request, response) {
        try {

            const sql =`
            SELECT
               contrato_id, 
               id_negociacao, 
               contrato_data_assinatura, 
               contrato_detalhes_contrato
               FROM CONTRATOS
        
            `;

            const [rows] = await db.query(sql);
            
            const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de contratos', 
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
    async cadastrarContratos(request, response) {
        try {

            const { id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato} = request.body;
            
            // Instrução SQL
            const sql = `
                INSERT INTO CONTRATOS (id_negociacao,
                 contrato_data_assinatura,
                 contrato_detalhes_contrato) 
                VALUES
                 (?,?,?)
                    `;

                    const values = [id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        id_negociacao: result.insertId,
                        contrato_data_assinatura,
                        contrato_detalhes_contrato
                    };


            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de usuários', 
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
    async editarContratos(request, response) {
        try {
            const { id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato } = request.body;
            const { id } = request.params;
    
            const sql = `
                UPDATE contratos SET
                    id_negociacao = ?, contrato_data_assinatura = ?, contrato_detalhes_contrato = ?
                WHERE
                    contrato_id = ?;
            `;
    
            const values = [id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato, id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Contrato com ID ${id} não encontrado!`,
                    dados: null
                });
            }
    
            const dados = {
                id_negociacao,
                contrato_data_assinatura,
                contrato_detalhes_contrato
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
    }
    , 
    async apagarContratos(request, response) {
        try {
            const ativo = false;
    
            const { id } = request.params;
            const sql = `UPDATE contratos SET
             contrato_ativo = ?
             where
             contrato_id = ?;
             `;
           
           
            const values = [ativo, id];
           const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
        return res.status(404).json({
            sucesso: false,
            mensagem: `contrato ${contrato_id} não encontrado!`,
            dados: null
        });
    }

            return response.status(200).json({
                sucesso: true, 
                mensagem: `contrato ${id} exclúdo com sucesso`, 
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
    async listarContratosFiltro(req, res) {
        try {
          const {
            id_negociacao, de_data, ate_data, detalhes
          } = req.query;
    
          const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
          const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
          const offset = (page - 1) * limit;
    
          const where = [];
          const values = [];
    
          if (id_negociacao && !isNaN(id_negociacao)) {
            where.push('c.id_negociacao = ?');
            values.push(Number(id_negociacao));
          }
          if (de_data && de_data.trim() !== '') {
            where.push('c.contrato_data_assinatura >= ?');
            values.push(de_data);
          }
          if (ate_data && ate_data.trim() !== '') {
            where.push('c.contrato_data_assinatura <= ?');
            values.push(ate_data);
          }
          if (detalhes && detalhes.trim() !== '') {
            where.push('c.contrato_detalhes_contrato LIKE ?');
            values.push(`%${detalhes}%`);
          }
    
          const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
          const selectSql =
            'SELECT ' +
            '  c.contrato_id, ' +
            '  c.id_negociacao, ' +
            '  c.contrato_data_assinatura, ' +
            '  c.contrato_detalhes_contrato ' +
            'FROM CONTRATOS c ' +
            whereSql +
            ' ORDER BY c.contrato_id DESC ' +
            'LIMIT ? OFFSET ?';
    
          const countSql =
            'SELECT COUNT(*) AS total ' +
            'FROM CONTRATOS c ' +
            whereSql;
    
          const [rows]   = await db.query(selectSql, [...values, limit, offset]);
          const [countR] = await db.query(countSql, values);
          const total = countR[0]?.total || 0;
    
          return res.status(200).json({
            sucesso: true,
            mensagem: 'Lista de contratos (filtros)',
            pagina: page,
            limite: limit,
            total,
            itens: rows.length,
            dados: rows
          });
        } catch (error) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar contratos', dados: error.message });
        }
      }
};