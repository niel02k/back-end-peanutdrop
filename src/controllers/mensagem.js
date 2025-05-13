const db = require('../dataBase/connection'); 

module.exports = {
    async listarMensagem(request, response) {
        try {

            const sql= `SELECT mens_id, negoc_id, id_usuario_remetente, mens_conteudo, mens_data_envio, mens_visualizada FROM MENSAGENS;`;


            const [rows] = await db.query(sql);
            const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de mensagem', 
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
   async cadastrarMensagem(request, response) {
    try {
        const {
            negoc_id,
            id_usuario_remetente,
            mens_conteudo,
            mens_data_envio,
            mens_visualizada
        } = request.body;

        const sql = `
            INSERT INTO MENSAGENS 
            (negoc_id, id_usuario_remetente, mens_conteudo, mens_data_envio, mens_visualizada) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            negoc_id,
            id_usuario_remetente,
            mens_conteudo,
            mens_data_envio,
            mens_visualizada
        ];

        const [result] = await db.query(sql, values);

        const dados = {
            id: result.insertId,
            negociacao: negoc_id,
            remetente: id_usuario_remetente,
            conteudo: mens_conteudo
        };

        return response.status(200).json({
            sucesso: true,
            mensagem: 'Cadastro de mensagem',
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

      async editarMensagem(request, response) {
        try {
            const { id } = request.params;
            const {
                conteudo,
                data_envio,
                visualizada
            } = request.body;
    
            const sql = `
                UPDATE MENSAGENS
                SET 
                    mens_conteudo = ?, 
                    mens_data_envio = ?, 
                    mens_visualizada = ?
                WHERE mens_id = ?
            `;
    
            const values = [conteudo, data_envio, visualizada, id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Mensagem não encontrada para atualização.',
                    dados: null
                });
            }
    
            const dados = {
                id,
                conteudo,
                data_envio,
                visualizada
            };
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Mensagem ${id} atualizada com sucesso`,
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
async apagarMensagem(request, response) {
    try {
        const { id } = request.params;

        const sql = `DELETE FROM mensagens WHERE mens_id = ?`;

        const values = [id];

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return response.status(404).json({
                sucesso: false,
                mensagem: `Mensagem ${id} não encontrada.`,
                dados: null
            });
        }

        return response.status(200).json({
            sucesso: true,
            mensagem: `Mensagem ${id} excluída com sucesso.`,
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