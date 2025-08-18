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
    
};  