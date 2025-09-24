const db = require('../dataBase/connection'); 

module.exports = {
    // Listagem de certificações
    // Retorna todas as certificações cadastradas
    async listarCertificacoes(request, response) {
        try {

            const sql = `
            SELECT 
            cert_id, 
            cert_orgao_regulador, 
            cert_nome
           
            FROM CERTIFICACOES
          ;

            
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
    // Cadastro de certificação
    // Insere uma nova certificação no banco de dados
    async cadastrarCertificacoes(request, response) {
        try {
            const {cert_orgao_regulador, cert_nome} = request.body;
            
            // Instrução SQL
            const sql = `
              INSERT INTO CERTIFICACOES (cert_orgao_regulador, cert_nome) VALUES
                (?,?) 
               
               `;
                    const values = [cert_orgao_regulador, cert_nome];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        cert_orgao_regulador,
                        cert_nome
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
    // Atualização de certificação
    // Atualiza dados da certificação
    // Retorna erro 404 se certificação não encontrada
    async editarCertificacoes(request, response) {
        try {

            const { cert_orgao_regulador, cert_nome } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE CERTIFICACOES SET
                   cert_orgao_regulador =?, cert_nome =?
                WHERE
                     cert_id = ?;
            `;

            const values = [cert_orgao_regulador, cert_nome, id ];

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
                cert_orgao_regulador, 
                cert_nome
            };




            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Alteração no cadastro das certificações', 
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
    async apagarCertificacoes(request, response) {
        try {
            const ativo =false;
            const {id} = request.params;

            const sql =`UPDATE CERTIFICACOES SET
            cert_ativo =?

            where cert_id = ?;`;

            const values = [id];
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    sucesso:false,
                    mensagem: `certificado ${ cert_id} não encontrado!`,
                    dados:null
                });
            }
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Exclusão das certificações', 
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
    async listarCertificacoesFiltro(req, res) {
        try {
          const {
            orgao_regulador, nome
          } = req.query;
    
          const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
          const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
          const offset = (page - 1) * limit;
    
          const where = [];
          const values = [];
    
          if (orgao_regulador && orgao_regulador.trim() !== '') {
            where.push('c.cert_orgao_regulador LIKE ?');
            values.push(`%${orgao_regulador}%`);
          }
          if (nome && nome.trim() !== '') {
            where.push('c.cert_nome LIKE ?');
            values.push(`%${nome}%`);
          }
    
          const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
          const selectSql =
            'SELECT ' +
            '  c.cert_id, ' +
            '  c.cert_orgao_regulador, ' +
            '  c.cert_nome ' +
            'FROM CERTIFICACOES c ' +
            whereSql +
            ' ORDER BY c.cert_id DESC ' +
            'LIMIT ? OFFSET ?';
    
          const countSql =
            'SELECT COUNT(*) AS total ' +
            'FROM CERTIFICACOES c ' +
            whereSql;
    
          const [rows]   = await db.query(selectSql, [...values, limit, offset]);
          const [countR] = await db.query(countSql, values);
          const total = countR[0]?.total || 0;
    
          return res.status(200).json({
            sucesso: true,
            mensagem: 'Lista de certificações (filtros)',
            pagina: page,
            limite: limit,
            total,
            itens: rows.length,
            dados: rows
          });
        } catch (error) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar certificações', dados: error.message });
        }
      }
};