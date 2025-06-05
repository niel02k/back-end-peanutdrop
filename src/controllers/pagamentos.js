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
};  