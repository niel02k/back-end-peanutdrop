const db = require('../dataBase/connection'); 

module.exports = {
    async listarNegociacoes(request, response) {
        try {
          const sql =`SELECT negoc_id, oferta_id, demanda_id, negoc_status FROM NEGOCIACOES;`
          const [rows] = await db.query(sql);
          const nRegistros = rows.length;
          
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de negociacoes', 
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
    async cadastrarNegociacoes(request, response) {
        try {
            const {
                oferta_id,
                demanda_id,
                negoc_status
            } = request.body;
    
            const sql = `
                INSERT INTO NEGOCIACOES 
                (oferta_id, demanda_id, negoc_status) 
                VALUES (?, ?, ?)
            `;
    
            const values = [
                oferta_id,
                demanda_id,
                negoc_status
            ];
    
            const [result] = await db.query(sql, values);
    
            const dados = {
                id: result.insertId,
                oferta: oferta_id,
                demanda: demanda_id,
                status: negoc_status
            };
    
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cadastro de negociações',
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
    async editarNegociacoes(request, response) {
        try {
            const { id } = request.params;
            const { status } = request.body;
    
            const sql = `
                UPDATE NEGOCIACOES
                SET negoc_status = ?
                WHERE negoc_id = ?
            `;
    
            const values = [status, id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Negociação não encontrada para atualização.',
                    dados: null
                });
            }
    
            const dados = {
                id,
                status
            };
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Negociação ${id} atualizada com sucesso`,
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
    async apagarNegociacoes(request, response) {
        try {
            const { id } = request.params;
    
            const sql = `DELETE FROM negociacoes WHERE negoc_id = ?`;
            const values = [id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Negociação ${id} não encontrada.`,
                    dados: null
                });
            }
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Negociação ${id} excluída com sucesso.`,
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