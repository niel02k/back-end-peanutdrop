const db = require('../dataBase/connection'); 

module.exports = {
    async listarEmpresas(request, response) {
        try {

            const sql = `
            SELECT
                emp_id, emp_razao_social, emp_nome_fantasia, 
                emp_tipo_atividade, emp_telefone, emp_email 
            FROM EMPRESAS;
                        `;
            
            const [rows] = await db.query(sql);

            const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Empresas', 
                dados: rows,
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na requisição.', 
                dados: error.message
            });
        }
    }, 
    async cadastrarEmpresas(request, response) {
        try {

            const {razao_social, nome_fantasia, tipo_atividade, telefone, email} = request.body;

            //instruções sql
            const sql = `
                INSERT INTO EMPRESAS
                    (emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, emp_telefone, emp_email) 
                VALUES
                    (?, ?, ? ,? ,?);
            `;

            const values = [razao_social, nome_fantasia, tipo_atividade, telefone, email];
            
            const [result] = await db.query(sql, values);

            const dados= {
                razao_social, 
                nome_fantasia, 
                tipo_atividade, 
                telefone, 
                email
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Empresas', 
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
    async editarEmpresas(request, response) {
        try {
            const id = request.params.id;
    
            const { razao_social, nome_fantasia, tipo_atividade, telefone, email } = request.body;
    
            const sql = `
                UPDATE EMPRESAS
                SET
                    emp_razao_social = ?,
                    emp_nome_fantasia = ?,
                    emp_tipo_atividade = ?,
                    emp_telefone = ?,
                    emp_email = ?
                WHERE
                    emp_id = ?
            `;
    
            const dados = [razao_social, nome_fantasia, tipo_atividade, telefone, email, id];
    
            await db.query(sql, dados);
    
            const [result] = await db.query(sql, dados);

        
        return response.status(200).json({
            sucesso: true,
            mensagem: 'Alteração no cadastro de Empresas',
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
    async apagarEmpresas(request, response) {
        try {
    
            const { id } = request.params;
    
            const sql = `DELETE FROM EMPRESAS WHERE emp_id = ?`;
    
            const values = [id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Empresa ${id} não encontrada`,
                });
            }
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Empresa ${id} excluída com sucesso`,
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