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
               nota_fiscal_detalhes, 
               nota_fiscal_ativo = 1 AS nota_fiscal_ativo  
               FROM NOTAS_FISCAIS
               WHERE nota_fiscal_ativo = 1;
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
            
            // Instrução SQL
            const sql = `
              INSERT INTO NOTAS_FISCAIS (contrato_id,
               nota_fiscal_numero,
                nota_fiscal_data_emissao,
                 nota_fiscal_detalhes) VALUES
                 (?,?,?,?)
                    `;

                    const values = [contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        contrato_id: result.insertId,
                        nota_fiscal_numero, 
                        nota_fiscal_data_emissao, 
                        nota_fiscal_detalhes
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
    async editarNotas_fiscais(request, response) {
        try {
            const { contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes } = request.body;
            const { id } = request.params;
    
            const sql = `
                UPDATE NOTAS_FISCAIS SET
                    contrato_id =?, nota_fiscal_numero =?, nota_fiscal_data_emissao =?, nota_fiscal_detalhes =?
                WHERE
                    nota_fiscal_id = ?;
            `;
    
            const values = [contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes, id];
    
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
                nota_fiscal_numero, 
                nota_fiscal_data_emissao, 
                nota_fiscal_detalhes
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
    async apagarNotas_fiscais(request, response) {
        try {
            const ativo = false;

            const { id } = request.params;
            const sql = `UPDATE notas_fiscais SET
             nota_fiscal_id = ?
             WHERE
             nota_fiscal_id = ?;
             `;

           const values = [ativo, id];
           const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
        return res.status(404).json({
            sucesso: false,
            mensagem: `Nota fiscal ${nota_fiscal_id} não encontrado!`,
            dados: null
        });
    }
            return response.status(200).json({
                sucesso: true, 
                mensagem: `Nota fiscal ${id} excluida com sucesso.`, 
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
