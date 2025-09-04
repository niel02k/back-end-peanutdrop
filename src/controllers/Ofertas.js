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
      // 1) Ler filtros e paginação
      const { ofe_titulo, ofe_descricao, promocao, ativo } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      // 2) Montagem do WHERE dinâmico
      const where = [];
      const values = [];

      if (ofe_titulo && ofe_titulo.trim() !== '') {
        where.push('o.ofe_titulo LIKE ?');
        values.push(`%${ofe_titulo}%`);
      }
      if (ofe_descricao && ofe_descricao.trim() !== '') {
        where.push('o.ofe_descricao LIKE ?');
        values.push(`%${ofe_descricao}%`);
      }
      // flags opcionais (0/1); aceita "0" e "1" como string
      if (promocao !== undefined && promocao !== '') {
        where.push('(o.ofe_promocao + 0) = ?');
        values.push(Number(promocao) ? 1 : 0);
      }
      if (ativo !== undefined && ativo !== '') {
        where.push('(o.ofe_ativo + 0) = ?');
        values.push(Number(ativo) ? 1 : 0);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      // 3) SELECT paginado (com CAST de BIT -> 0/1)
      const selectSql =
        'SELECT ' +
        '  o.ofe_id        AS id, ' +
        '  o.ofe_titulo    AS titulo, ' +
        '  o.ofe_descricao AS descricao, ' +
        '  (o.ofe_promocao + 0) AS promocao, ' + // BIT -> 0/1
        '  (o.ofe_ativo + 0)    AS ativo ' +
        'FROM OFERTAS o ' + // troque para "ofertas" se esse for seu nome de tabela
        whereSql +
        ' ORDER BY o.ofe_id DESC ' +
        'LIMIT ? OFFSET ?';

      // 4) COUNT total com os mesmos filtros
      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM OFERTAS o ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      // 5) Resposta padronizada
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de ofertas',
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
        '  o.ofe_id        AS id, ' +
        '  o.ofe_titulo    AS titulo, ' +
        '  o.ofe_descricao AS descricao, ' +
        '  (o.ofe_promocao + 0) AS promocao ' +
        'FROM OFERTAS o ' +
        'WHERE (o.ofe_promocao + 0) = 1 ' +
        'ORDER BY RAND() ' +
        'LIMIT 3';

      const [rows] = await db.query(sql);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Destaques de ofertas',
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