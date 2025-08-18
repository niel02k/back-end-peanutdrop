const db = require('../dataBase/connection'); 

module.exports = {
    async listarAgr_certificacoes(request, response) {
        try {

             const sql = `SELECT
             agr_cert_id, agri_id, cert_id, agr_local,
             agr_data, agr_arquivo, agr_status
            
             FROM AGR_CERTIFICACOES
          
          `;

            


             const [rows]  = await db.query(sql);
             
             const nRegistros =  rows.length;


<<<<<<< HEAD
<<<<<<< HEAD
// PATCH /agrCertificacoes/:id  - Atualiza **apenas atributos**; não troque o vínculo N:N aqui.
  async editarAgrCertAtributos(req, res) {
    try {
      const { id } = req.params;
      const [check] = await db.query('SELECT agc_id FROM agr_certificacoes WHERE agc_id = ?', [id]);
      if (!check.length) return sendNotFound(res);
=======
=======
>>>>>>> parent of 7cdc967 (a)
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
    async cadastrarAgr_certificacoes(request, response) {
        try {
            const { agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status } = request.body;
            
            // Instrução SQL
            const sql = `
               INSERT INTO AGR_CERTIFICACOES (agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status) VALUES
                (?,?,?,?,?,?) 
               
               `;
                    const values = [agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status];
<<<<<<< HEAD
>>>>>>> parent of 7cdc967 (a)
=======
>>>>>>> parent of 7cdc967 (a)

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
    async editarAgr_certificacoes(request, response) {
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
    async apagarAgr_certificacoes(request, response) {
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
};  