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

    async listarPropostasFiltro(req, res) {
  try {
    // 1) Lê filtros e paginação
    const { pro_status, pro_observacao, ofe_titulo } = req.query;
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const offset = (page - 1) * limit;

    // 2) WHERE dinâmico
    const where = [];
    const values = [];

    if (pro_status && pro_status.trim() !== '') {
      where.push('p.pro_status LIKE ?');
      values.push(`%${pro_status}%`);
    }
    if (pro_observacao && pro_observacao.trim() !== '') {
      where.push('p.pro_observacao LIKE ?');
      values.push(`%${pro_observacao}%`);
    }
    if (ofe_titulo && ofe_titulo.trim() !== '') {
      where.push('o.ofe_titulo LIKE ?');
      values.push(`%${ofe_titulo}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // 3) SELECT com JOIN + CAST
    const sql = `
      SELECT
        p.pro_id        AS id,
        p.pro_status    AS status,
        p.pro_observacao AS observacao,
        CAST(p.pro_ativa AS UNSIGNED) AS ativa,
        p.pro_ofe_id    AS oferta_id,
        o.ofe_titulo    AS oferta_titulo
      FROM propostas p
      INNER JOIN ofertas o ON o.ofe_id = p.pro_ofe_id
      ${whereSql}
      ORDER BY p.pro_id DESC
      LIMIT ? OFFSET ?
    `;

    // 4) COUNT total
    const sqlCount = `
      SELECT COUNT(*) AS total
      FROM propostas p
      INNER JOIN ofertas o ON o.ofe_id = p.pro_ofe_id
      ${whereSql}
    `;

    const [rows]   = await db.query(sql, [...values, limit, offset]);
    const [countR] = await db.query(sqlCount, values);
    const total = countR[0]?.total || 0;

    // 5) Retorno padronizado
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Lista de propostas',
      pagina: page,
      limite: limit,
      total,
      itens: rows.length,
      dados: rows
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar propostas',
      dados: error.message
    });
  }
},
}