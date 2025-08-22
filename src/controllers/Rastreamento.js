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

    async listarRastreamentoFiltro (req, res) {
  try {
    // 1) Lê filtros e paginação
    const { ras_lote, ras_status, agr_nome } = req.query; // parâmetros de busca
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const offset = (page - 1) * limit;

    // 2) WHERE dinâmico (monta só com o que vier)
    const where = [];
    const values = [];

    if (ras_lote && ras_lote.trim() !== '') {
      where.push('rp.ras_lote LIKE ?');
      values.push(`%${ras_lote}%`);
    }
    if (ras_status && ras_status.trim() !== '') {
      where.push('rp.ras_status LIKE ?'); // se status for categórico fixo, você pode trocar por "="
      values.push(`%${ras_status}%`);
    }
    if (agr_nome && agr_nome.trim() !== '') {
      where.push('a.agr_nome LIKE ?');
      values.push(`%${agr_nome}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // 3) SELECT com JOIN + CAST de BIT + paginação
    const sql = `
      SELECT
        rp.ras_id                 AS id,
        rp.ras_lote               AS lote,
        rp.ras_status             AS status,
        CAST(rp.ras_ativo AS UNSIGNED) AS ativo,
        rp.ras_agr_id             AS agricultor_id,
        a.agr_nome                AS agricultor_nome
      FROM rastreamento_producao rp
      INNER JOIN agricultores a ON a.agr_id = rp.ras_agr_id
      ${whereSql}
      ORDER BY rp.ras_id DESC
      LIMIT ? OFFSET ?
    `;

    // 4) COUNT total com mesmos filtros
    const sqlCount = `
      SELECT COUNT(*) AS total
      FROM rastreamento_producao rp
      INNER JOIN agricultores a ON a.agr_id = rp.ras_agr_id
      ${whereSql}
    `;

    // executa (empilha paginação no final dos values)
    const [rows]   = await db.query(sql,      [...values, limit, offset]);
    const [countR] = await db.query(sqlCount, values);
    const total = countR[0]?.total || 0;

    // 5) Retorno padronizado
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Lista de rastreamentos da produção',
      pagina: page,
      limite: limit,
      total,                 // total de registros que batem o filtro
      itens: rows.length,    // itens retornados nesta página
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
 