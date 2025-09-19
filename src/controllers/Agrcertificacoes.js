const db = require('../dataBase/connection'); 

module.exports = {
    async listarAgrcertificacoes(request, response) {
        try {

             const sql = `SELECT
             agr_cert_id, agri_id, cert_id, agr_local,
             agr_data, agr_arquivo, agr_status
            
             FROM AGR_CERTIFICACOES
          
          `;

            


             const [rows]  = await db.query(sql);
             
             const nRegistros =  rows.length;


            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de certificacoes', 
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
    async cadastrarAgrcertificacoes(request, response) {
        try {
            const { agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status } = request.body;
            
            // Instrução SQL
            const sql = `
               INSERT INTO AGR_CERTIFICACOES (agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status) VALUES
                (?,?,?,?,?,?) 
               
               `;
                    const values = [agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        agri_id: result.insertId,
                        cert_id,
                        agr_local,
                        agr_data,
                        agr_arquivo,
                        agr_status
                    };



            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de certificacoes', 
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
    async editarAgrcertificacoes(request, response) {
        try {
            const { agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE AGR_CERTIFICACOES SET
                   agri_id =?, cert_id =? , agr_local =?, agr_data =?, agr_arquivo =?, agr_status =?
                WHERE
                    agr_cert_id= ?;
            `;

            const values = [agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status, id ];

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
                cert_id, 
                agr_local,
                agr_data, 
                agr_arquivo, 
                agr_status
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
    async apagarAgrcertificacoes(request, response) {
        try {
            const ativo = false;
    
            const { id } = request.params;
            const sql = `UPDATE AGR_CERTIFICACOES SET
             agr_ativo = ?
             where
             agr_id = ?;
             `;

            const values = [ativo, id];
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    sucesso:false,
                    mensagem: `certifiações  ${agr_cert_id} não encontrado!`,
                    dados:null
                });
            }

            return response.status(200).json({
                sucesso: true, 
            mensagem:  `  ${id}  exclusão das certificações`, 
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
    async listarAgrcertificacoesFiltro(req, res) {
        try {
          const {
            agri_id, cert_id, local, status
          } = req.query;
    
          const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
          const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
          const offset = (page - 1) * limit;
    
          const where = [];
          const values = [];
    
          if (agri_id && !isNaN(agri_id)) {
            where.push('a.agri_id = ?');
            values.push(Number(agri_id));
          }
          if (cert_id && !isNaN(cert_id)) {
            where.push('a.cert_id = ?');
            values.push(Number(cert_id));
          }
          if (local && local.trim() !== '') {
            where.push('a.agr_local LIKE ?');
            values.push(`%${local}%`);
          }
          if (status !== undefined && status !== '') {
            where.push('a.agr_status = ?');
            values.push(Number(status));
          }
    
          const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
          const selectSql =
            'SELECT ' +
            '  a.agr_cert_id, ' +
            '  a.agri_id, ' +
            '  a.cert_id, ' +
            '  a.agr_local, ' +
            '  a.agr_data, ' +
            '  a.agr_arquivo, ' +
            '  a.agr_status ' +
            'FROM AGR_CERTIFICACOES a ' +
            whereSql +
            ' ORDER BY a.agr_cert_id DESC ' +
            'LIMIT ? OFFSET ?';
    
          const countSql =
            'SELECT COUNT(*) AS total ' +
            'FROM AGR_CERTIFICACOES a ' +
            whereSql;
    
          const [rows]   = await db.query(selectSql, [...values, limit, offset]);
          const [countR] = await db.query(countSql, values);
          const total = countR[0]?.total || 0;
    
          return res.status(200).json({
            sucesso: true,
            mensagem: 'Lista de certificações de agricultores (filtros)',
            pagina: page,
            limite: limit,
            total,
            itens: rows.length,
            dados: rows
          });
        } catch (error) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar certificações de agricultores', dados: error.message });
        }
      }
};