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
};  