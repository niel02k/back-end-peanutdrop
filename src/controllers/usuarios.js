const db = require('../dataBase/connection'); 

module.exports = {
    async listarUsuarios(request, response) {
        try {

            const sql= `SELECT usu_id,usu_tipo_usuario,usu_nome,usu_documento,usu_email, usu_senha,usu_endereco,usu_telefone ,usu_data_cadastro FROM USUARIOS;`;


            const [rows] = await db.query(sql);
            const nRegistros = rows.length;
            
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de usuários', 
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
    async cadastrarUsuarios(request, response) {
        try {

                    const {
                        usu_tipo_usuario,
                        usu_nome,
                        usu_documento,
                        usu_email,
                        usu_senha,
                        usu_endereco,
                        usu_telefone,
                        usu_data_cadastro
                    } = request.body;
            
                    const sql = `
                        INSERT INTO USUARIOS 
                        (usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, usu_endereco, usu_telefone, usu_data_cadastro) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
            
                    const values = [
                        usu_tipo_usuario,
                        usu_nome,
                        usu_documento,
                        usu_email,
                        usu_senha,
                        usu_endereco,
                        usu_telefone,
                        usu_data_cadastro
                    ];
            
                    const [result] = await db.query(sql, values);
            
                    const dados = {
                        id: result.insertId,
                        nome: usu_nome,
                        email: usu_email,
                        tipo: usu_tipo_usuario
                    };
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de usuários', 
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
    async editarUsuarios(request, response) {
        try {
            const { id } = request.params;
            const {
                nome,
                email,
                senha,
                endereco,
                telefone
            } = request.body;
    
            const sql = `
                UPDATE USUARIOS 
                SET 
                    usu_nome = ?, 
                    usu_email = ?, 
                    usu_senha = ?, 
                    usu_endereco = ?, 
                    usu_telefone = ?
                WHERE usu_id = ?
            `;
    
            const values = [nome, email, senha, endereco, telefone, id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado para atualização.',
                    dados: null
                });
            }
    
            const dados = {
                id,
                nome,
                email,
                telefone,
                endereco,
                senha
            };
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} atualizado com sucesso`,
                dados
            });
    
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    }
    ,    
    async apagarUsuarios(request, response) {
        try {

            const {id}= request.params;

            const sql = `DELETE FROM usuarios WHERE usu_id = ?`;

            const values = [id];

            const [result] = await db.query(sql, values);
 

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usario ${id} não encontrado ` ,
                    dados: null
                });
            }
    
            

            return response.status(200).json({
                sucesso: true, 
                mensagem: `Usario ${id} excluido com sucesso `, 
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