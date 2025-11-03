const db = require('../dataBase/connection');
const { gerarUrl } = require('../../src/utils/gerarUrl');

module.exports = {
    // Listagem de empresas
    // Retorna todas as empresas cadastradas
    async listarEmpresas(request, response) {
        try {

            const sql = `
            SELECT
                emp_id, emp_razao_social, emp_nome_fantasia, 
                emp_tipo_atividade, emp_telefone, emp_email, emp_img
            FROM EMPRESAS;
                        `;
            
            const [rows] = await db.query(sql);

            const nRegistros = rows.length;

            const dados = rows.map (empresas => ({
                ...empresas,
                emp_img: gerarUrl(empresas.emp_img, 'empresas', 'padrao.jpg')
            }));

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Empresas', 
                nRegistros,
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
    // Cadastro de empresa
    // Insere uma nova empresa no banco de dados
    async cadastrarEmpresas(request, response) {
        try {

            const {razao_social, nome_fantasia, tipo_atividade, telefone, email, imagem} = request.body;
            
             // VERIFICA SE TEM UPLOAD OU URL
            let imagemFinal = null;
            let urlImagem = null;

            if (request.file) {
            // Tem upload de arquivo
            imagemFinal = request.file.filename;
            urlImagem = gerarUrl(imagemFinal, 'empresas');
            } else if (imagem) {
            // Tem URL no body - usa diretamente
            imagemFinal = imagem; // ← Isso deveria salvar a URL
            urlImagem = imagem;   // ← Mas você está salvando 'padrao.jpg' abaixo!
            } else {
            // Não tem upload nem URL - usa imagem padrão
            imagemFinal = 'padrao.jpg'; // ← AQUI ESTÁ O PROBLEMA!
            urlImagem = gerarUrl('padrao.jpg', 'empresas', 'padrao.jpg');
            }
        // Se não tiver nenhum, ambos ficam null
            //instruções sql
            const sql = `
                INSERT INTO EMPRESAS
                    (emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, emp_telefone, emp_email, emp_img) 
                VALUES
                    (?, ?, ? ,? ,?, ?);
            `;

            const values = [razao_social, nome_fantasia, tipo_atividade, telefone, email, imagemFinal];
            
            const [result] = await db.query(sql, values);

            const dados= {
                razao_social, 
                nome_fantasia, 
                tipo_atividade, 
                telefone, 
                email,
                imagem: urlImagem
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
    // Atualização de empresa
    // Atualiza dados da empresa
    // Retorna erro 404 se empresa não encontrada
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
    // Exclusão de empresa
    // Remove uma empresa do banco de dados
    // Retorna erro 404 se empresa não encontrada
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

async listarEmpresasFiltro(req, res) {
    try {
      const {
        razao,       // LIKE em emp_razao_social
        fantasia,    // LIKE em emp_nome_fantasia
        atividade,   // LIKE em emp_tipo_atividade
        email        // LIKE em emp_email
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (razao && razao.trim() !== '') {
        where.push('e.emp_razao_social LIKE ?');
        values.push(`%${razao}%`);
      }
      if (fantasia && fantasia.trim() !== '') {
        where.push('e.emp_nome_fantasia LIKE ?');
        values.push(`%${fantasia}%`);
      }
      if (atividade && atividade.trim() !== '') {
        where.push('e.emp_tipo_atividade LIKE ?');
        values.push(`%${atividade}%`);
      }
      if (email && email.trim() !== '') {
        where.push('e.emp_email LIKE ?');
        values.push(`%${email}%`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql =
        'SELECT ' +
        '  e.emp_id, ' +
        '  e.emp_razao_social, ' +
        '  e.emp_nome_fantasia, ' +
        '  e.emp_tipo_atividade, ' +
        '  e.emp_telefone, ' +
        '  e.emp_email ' +
        'FROM EMPRESAS e ' +
        whereSql +
        ' ORDER BY e.emp_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM EMPRESAS e ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de empresas (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar empresas', dados: error.message });
    }
  }
 
};