const db = require('../dataBase/connection'); 

module.exports = {
    async listarRastreamento(request, response) {
        try {

            const sql = `
           SELECT 
           rast_id,
            agri_id, 
            amen_id,
            rast_data_plantacao, 
            rast_data_colheita, 
            rast_informacoes_adicionais, 
            rast_area_plantacao
            FROM RASTREAMENTO_PRODUCAO
           
         `;


         const [rows]  = await db.query(sql);
         
         const nRegistros =  rows.length;

         return response.status(200).json({
            sucesso: true, 
            mensagem: 'Lista de rastreamento', 
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
    async cadastrarRastreamento(request, response) {
        try {
            const { agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao } = request.body;
            
            // Instrução SQL
            const sql = `
               INSERT INTO RASTREAMENTO_PRODUCAO (agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao) VALUES
                (?,?,?,?,?,?) 
               
               `;
                    const values = [agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        agri_id: result.insertId,
                        amen_id,
                        rast_data_plantacao,
                        rast_data_colheita,
                        rast_informacoes_adicionais,
                        rast_area_plantacao
                    };



            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de rastremento', 
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
    async editarRastreamento(request, response) {
        try {


            const {agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE RASTREAMENTO_PRODUCAO SET
                  agri_id =?, amen_id =?, rast_data_plantacao =? , rast_data_colheita =?, rast_informacoes_adicionais =?, rast_area_plantacao =?
                WHERE
                    rast_id  = ?;
            `;

            const values = [agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao, id ];

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
                rast_data_plantacao,
                rast_data_colheita,
                rast_informacoes_adicionais,
                rast_area_plantacao,
            };






            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Alteração no cadastro de rastreamento', 
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
    async apagarRastreamento(request, response) {
        try {
            const {id} = request.params;
            const ativo = false;

            const sql =`UPDATE RASTREAMENTO_PRODUCAO SET
            rast_ativo =?
            where
            rast_id=?`;

            const values = [id];
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    sucesso:false,
                    mensagem: `Usuário ${ rast_id} não encontrado!`,
                    dados:null
                });
            }
           
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Exclusão de rastreamento', 
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

    async listarRastreamentoFiltro(req, res) {
    try {
      const {
        agri_id,               // =
        amen_id,               // =
        de_plantacao,          // >= rast_data_plantacao
        ate_plantacao,         // <= rast_data_plantacao
        de_colheita,           // >= rast_data_colheita
        ate_colheita,          // <= rast_data_colheita
        texto,                 // LIKE em rast_informacoes_adicionais
        min_area, max_area     // faixa em rast_area_plantacao
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (agri_id && !isNaN(agri_id)) {
        where.push('r.agri_id = ?');
        values.push(Number(agri_id));
      }
      if (amen_id && !isNaN(amen_id)) {
        where.push('r.amen_id = ?');
        values.push(Number(amen_id));
      }
      if (de_plantacao && de_plantacao.trim() !== '') {
        where.push('r.rast_data_plantacao >= ?');
        values.push(de_plantacao);
      }
      if (ate_plantacao && ate_plantacao.trim() !== '') {
        where.push('r.rast_data_plantacao <= ?');
        values.push(ate_plantacao);
      }
      if (de_colheita && de_colheita.trim() !== '') {
        where.push('r.rast_data_colheita >= ?');
        values.push(de_colheita);
      }
      if (ate_colheita && ate_colheita.trim() !== '') {
        where.push('r.rast_data_colheita <= ?');
        values.push(ate_colheita);
      }
      if (texto && texto.trim() !== '') {
        where.push('r.rast_informacoes_adicionais LIKE ?');
        values.push(`%${texto}%`);
      }
      if (min_area && !isNaN(min_area)) {
        where.push('r.rast_area_plantacao >= ?');
        values.push(Number(min_area));
      }
      if (max_area && !isNaN(max_area)) {
        where.push('r.rast_area_plantacao <= ?');
        values.push(Number(max_area));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  r.rast_id, ' +
        '  r.agri_id, ' +
        '  r.amen_id, ' +
        '  r.rast_data_plantacao, ' +
        '  r.rast_data_colheita, ' +
        '  r.rast_informacoes_adicionais, ' +
        '  r.rast_area_plantacao ' +
        'FROM RASTREAMENTO_PRODUCAO r ' +
        whereSql +
        ' ORDER BY r.rast_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM RASTREAMENTO_PRODUCAO r ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de rastreamento (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar rastreamento',
        dados: error.message
      });
    }
  }
};
 