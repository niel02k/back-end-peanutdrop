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

    // >>> NOVO: Listagem com filtros + paginação + total
async listarNegociacoesFiltro(req, res) {
    try {
      const { negoc_status, oferta_id, demanda_id } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (negoc_status !== undefined && String(negoc_status).trim() !== '') {
        where.push('n.negoc_status = ?'); // numérico (TINYINT)
        values.push(Number(negoc_status));
      }
      if (oferta_id !== undefined && String(oferta_id).trim() !== '' && !isNaN(oferta_id)) {
        where.push('n.oferta_id = ?');
        values.push(Number(oferta_id));
      }
      if (demanda_id !== undefined && String(demanda_id).trim() !== '' && !isNaN(demanda_id)) {
        where.push('n.demanda_id = ?');
        values.push(Number(demanda_id));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  n.negoc_id, ' +
        '  n.oferta_id, ' +
        '  n.demanda_id, ' +
        '  n.negoc_status ' +
        'FROM NEGOCIACOES n ' +
        whereSql +
        ' ORDER BY n.negoc_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM NEGOCIACOES n ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de negociações (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar negociações',
        dados: error.message
      });
    }
  }
};  