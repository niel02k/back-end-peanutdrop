const db = require('../dataBase/connection'); 

module.exports = {
    async listarOfertas(request, response) {
        try {

         
            const sql = `
           SELECT oferta_id, agri_id, amen_id, oferta_quantidade, 
           oferta_preco, oferta_data_colheita, oferta_outras_informacoes, 
           oferta_data_publicacao, oferta_ativa FROM OFERTAS;
         `;

         const [rows] = await db.query(sql);

         const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Ofertas', 
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
    async cadastrarOfertas(request, response) {
        try {

        
            const { agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa } = request.body;
            
            // Instrução SQL
            const sql = `
             INSERT INTO OFERTAS (agri_id, amen_id, 
             oferta_quantidade, oferta_preco, oferta_data_colheita, 
             oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa) 
             VALUES
                        (?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const values = [agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa];

                    const [result] = await db.query(sql, values);

                    const dados = {
                    inf_id: result.insertId,
                    agri_id,
                    amen_id,
                    oferta_quantidade, 
                    oferta_preco, 
                    oferta_data_colheita,
                    oferta_outras_informacoes, 
                    oferta_data_publicacao, 
                    oferta_ativa
                    };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Ofertas', 
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
    async editarOfertas(request, response) {
        try {

            const { agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE OFERTAS SET
                   agri_id = ?, amen_id = ?, oferta_quantidade = ?, oferta_preco = ?, oferta_data_colheita = ?, oferta_outras_informacoes = ?, oferta_data_publicacao = ?, oferta_ativa = ?
                WHERE
                    oferta_id = ?;
            `;

            const values = [ agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa, id ];

            const [result] = await db.query(sql, values);

            if(result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                })
            }

            const dados = {
              id,
              agri_id,
              amen_id, 
              oferta_quantidade,
              oferta_preco, 
              oferta_data_colheita, 
              oferta_outras_informacoes,
              oferta_data_publicacao,
              oferta_ativa
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: `Usuário ${id} atualizado com sucesso!`, 
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
    async apagarOfertas(request, response) {
        try {
 
            const { id } = request.params;

            const sql = `DELETE FROM OFERTAS WHERE oferta_id = ?`;

            const values = [id];

            const [result] = await db.query(sql, values);

            if(result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Oferta ${oferta_id} não encontrada!`,
                    dados: null
                })
            }

            return response.status(200).json({
                sucesso: true, 
                mensagem: `Oferta ${id} excluída com sucesso`, 
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

    async listarOfertasFiltro(req, res) {
    try {
      const {
        agri_id,
        amen_id,
        min_quantidade,
        max_quantidade,
        min_preco,
        max_preco,
        de_colheita,
        ate_colheita,
        texto,   // busca em oferta_outras_informacoes
        ativa    // 0/1
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (agri_id && !isNaN(agri_id)) {
        where.push('o.agri_id = ?');
        values.push(Number(agri_id));
      }
      if (amen_id && !isNaN(amen_id)) {
        where.push('o.amen_id = ?');
        values.push(Number(amen_id));
      }
      if (min_quantidade && !isNaN(min_quantidade)) {
        where.push('o.oferta_quantidade >= ?');
        values.push(Number(min_quantidade));
      }
      if (max_quantidade && !isNaN(max_quantidade)) {
        where.push('o.oferta_quantidade <= ?');
        values.push(Number(max_quantidade));
      }
      if (min_preco && !isNaN(min_preco)) {
        where.push('o.oferta_preco >= ?');
        values.push(Number(min_preco));
      }
      if (max_preco && !isNaN(max_preco)) {
        where.push('o.oferta_preco <= ?');
        values.push(Number(max_preco));
      }
      if (de_colheita && de_colheita.trim() !== '') {
        where.push('o.oferta_data_colheita >= ?');
        values.push(de_colheita);
      }
      if (ate_colheita && ate_colheita.trim() !== '') {
        where.push('o.oferta_data_colheita <= ?');
        values.push(ate_colheita);
      }
      if (texto && texto.trim() !== '') {
        where.push('o.oferta_outras_informacoes LIKE ?');
        values.push(`%${texto}%`);
      }
      if (ativa !== undefined && ativa !== '') {
        where.push('(o.oferta_ativa + 0) = ?');
        values.push(Number(ativa) ? 1 : 0);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  o.oferta_id, ' +
        '  o.agri_id, ' +
        '  o.amen_id, ' +
        '  o.oferta_quantidade, ' +
        '  o.oferta_preco, ' +
        '  o.oferta_data_colheita, ' +
        '  o.oferta_outras_informacoes, ' +
        '  o.oferta_data_publicacao, ' +
        '  (o.oferta_ativa + 0) AS oferta_ativa ' +
        'FROM OFERTAS o ' +
        whereSql +
        ' ORDER BY o.oferta_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM OFERTAS o ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de ofertas (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar ofertas',
        dados: error.message
      });
    }
  },

async listarDestaques(req, res) {
    try {
      const sql =
        'SELECT ' +
        '  o.oferta_id, ' +
        '  o.agri_id, ' +
        '  o.amen_id, ' +
        '  o.oferta_quantidade, ' +
        '  o.oferta_preco, ' +
        '  o.oferta_data_colheita, ' +
        '  o.oferta_outras_informacoes, ' +
        '  o.oferta_data_publicacao ' +
        'FROM OFERTAS o ' +
        'WHERE (o.oferta_ativa + 0) = 1 ' +
        'ORDER BY RAND() ' +
        'LIMIT 3';

      const [rows] = await db.query(sql);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Destaques de ofertas (ativas)',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar destaques',
        dados: error.message
      });
    }
  }
};  