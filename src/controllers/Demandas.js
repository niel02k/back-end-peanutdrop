const db = require('../dataBase/connection'); 

module.exports = {
    async listarDemandas(request, response) {
        try {

            const sql = `
            SELECT
                demanda_id, emp_id, amen_id, demanda_quantidade, demanda_preco_maximo,
                demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa = 1 AS usu_ativo
            FROM DEMANDAS;
                        `;
            
            const [rows] = await db.query(sql);

            const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Demandas', 
                resultado: nRegistros,
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
    async cadastrarDemandas(request, response) {
        try {

            const {emp_id, amen_id, quantidade, preco_maximo, data_entrega, informacoes, data_publi, ativa} = request.body;

            //instruções sql
            const sql = `
                INSERT INTO DEMANDAS
                    (emp_id, amen_id, demanda_quantidade, demanda_preco_maximo, demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa) 
                VALUES
                    (?, ?, ? ,? ,? ,? ,? ,?);
            `;

            const values = [emp_id, amen_id, quantidade, preco_maximo, data_entrega, informacoes, data_publi, ativa];
            
            const [result] = await db.query(sql, values);

            const dados= {
                emp_id,
                amen_id,
                quantidade,
                preco_maximo,
                data_entrega,
                informacoes,
                data_publi,
                ativa
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Demandas', 
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
    async editarDemandas(request, response) {
        try {
            const id = request.params.id;
    
            const {
                emp_id,
                amen_id,
                quantidade,
                preco_maximo,
                data_entrega,
                informacoes,
                data_publi,
                ativa
            } = request.body;
    
            const sql = `
                UPDATE DEMANDAS
                SET
                    emp_id = ?,
                    amen_id = ?,
                    demanda_quantidade = ?,
                    demanda_preco_maximo = ?,
                    demanda_data_entrega = ?,
                    demanda_outras_informacoes = ?,
                    demanda_data_publicacao = ?,
                    demanda_ativa = ?
                WHERE
                    demanda_id = ?
            `;
    
            const values = [
                emp_id,
                amen_id,
                quantidade,
                preco_maximo,
                data_entrega,
                informacoes,
                data_publi,
                ativa,
                id
            ];
    
            const [rows] = await db.query(sql, values);
    
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Alteração no cadastro de Demandas',
                dados: rows // <- aqui vem affectedRows, changedRows, etc.
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    
    async apagarDemandas(request, response) {
        try {
            const { id } = request.params;
    
            const sql = `DELETE FROM demandas WHERE demanda_id = ?`; // coloque entre crases
    
            const values = [id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Demanda ${id} não encontrada`, // corrigido: template string e nome da variável
                });
            }
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Demanda ${id} excluída com sucesso`,
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