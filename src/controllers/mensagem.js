const db = require('../dataBase/connection'); 

module.exports = {
    // Listagem de mensagens
    // Retorna todas as mensagens cadastradas
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
    // Cadastro de mensagem
    // Insere uma nova mensagem no banco de dados
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
    // Atualização de mensagem
    // Atualiza conteúdo, data de envio e status de visualização
    // Retorna erro 404 se mensagem não encontrada
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

async listarMensagemFiltro(req, res) {
    try {
      const {
        negoc_id, id_usuario_remetente, conteudo, visualizada, de_data, ate_data
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (negoc_id && !isNaN(negoc_id)) {
        where.push('m.negoc_id = ?');
        values.push(Number(negoc_id));
      }
      if (id_usuario_remetente && !isNaN(id_usuario_remetente)) {
        where.push('m.id_usuario_remetente = ?');
        values.push(Number(id_usuario_remetente));
      }
      if (conteudo && conteudo.trim() !== '') {
        where.push('m.mens_conteudo LIKE ?');
        values.push(`%${conteudo}%`);
      }
      if (visualizada !== undefined && visualizada !== '') {
        where.push('m.mens_visualizada = ?');
        values.push(Number(visualizada));
      }
      if (de_data && de_data.trim() !== '') {
        where.push('m.mens_data_envio >= ?');
        values.push(de_data);
      }
      if (ate_data && ate_data.trim() !== '') {
        where.push('m.mens_data_envio <= ?');
        values.push(ate_data);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  m.mens_id, ' +
        '  m.negoc_id, ' +
        '  m.id_usuario_remetente, ' +
        '  m.mens_conteudo, ' +
        '  m.mens_data_envio, ' +
        '  m.mens_visualizada ' +
        'FROM MENSAGENS m ' +
        whereSql +
        ' ORDER BY m.mens_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM MENSAGENS m ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de mensagens (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar mensagens', dados: error.message });
    }
  }

};