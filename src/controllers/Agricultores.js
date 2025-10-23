const db = require('../dataBase/connection'); 
const { gerarUrl} = require ('../utils/gerarUrl');

module.exports = {
    // Listagem de agricultores
    // Retorna todos os agricultores cadastrados
    async listarAgricultores(request, response) {
        try {

                const sql = `
                   SELECT
                    agri_id, agri_localizacao_propriedade, 
                    agri_tipos_amendoim_cultivados, 
                    agri_certificacoes, agri_outras_informacoes
                  FROM AGRICULTORES;
                `;

                const [rows] = await db.query(sql);

                const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Agricultores', 
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
    // Cadastro de agricultor
    // Insere um novo agricultor no banco de dados
    async cadastrarAgricultores(request, response) {
        try {
            
            const { agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes } = request.body;
            let imagemFinal = null;
            let urlImagem = null;

            if (request.file) {
        // Tem upload de arquivo
        imagemFinal = request.file.filename;
        urlImagem = gerarUrl(imagemFinal, 'agricultores');
      } else if (imagem) {
        // Tem URL no body - usa diretamente
        imagemFinal = imagem; // ← Isso deveria salvar a URL
        urlImagem = imagem;   // ← Mas você está salvando 'padrao.jpg' abaixo!
      } else {
        // Não tem upload nem URL - usa imagem padrão
        imagemFinal = 'padrao.jpg'; // ← AQUI ESTÁ O PROBLEMA!
        urlImagem = gerarUrl('padrao.jpg', 'agricultores', 'padrao.jpg');
      }
            // Instrução SQL
            const sql = `
               INSERT INTO AGRICULTORES (agri_localizacao_propriedade, 
               agri_tipos_amendoim_cultivados, 
               agri_certificacoes, agri_outras_informacoes)
                VALUES
                        (?, ?, ?, ?)
                    `;

                    const values = [agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes];

                    const [result] = await db.query(sql, values);

                    const dados = {
                        inf_id: result.insertId,
                        agri_localizacao_propriedade, 
                        agri_tipos_amendoim_cultivados, 
                        agri_certificacoes, 
                        agri_outras_informacoes
                    };


            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Agricultores', 
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
    // Atualização de agricultor
    // Atualiza dados do agricultor
    // Retorna erro 404 se agricultor não encontrado
    async editarAgricultores(request, response) {
        try {

            const { agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE AGRICULTORES SET
                    agri_localizacao_propriedade = ?, agri_tipos_amendoim_cultivados = ?, agri_certificacoes = ?, agri_outras_informacoes = ?
                WHERE
                    agri_id = ?;
            `;

            const values = [ agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes, id ];

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
                agri_localizacao_propriedade,
                agri_tipos_amendoim_cultivados,
                agri_certificacoes,
                agri_outras_informacoes
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
    async apagarAgricultores(request, response) {
        try {

            const { id } = request.params;

            const sql = `DELETE FROM AGRICULTORES WHERE agri_id = ?`;

            const values = [id];

            const [result] = await db.query(sql, values);

            if(result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Agricultor ${agri_id} não encontrado!`,
                    dados: null
                })
            }

            return response.status(200).json({
                sucesso: true, 
                mensagem: `Agricultor ${id} excluído com sucesso`, 
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
    async listarAgricultoresFiltro(req, res) {
        try {
          const {
            localizacao, tipos_amendoim, certificacoes, outras_info
          } = req.query;
    
          const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
          const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
          const offset = (page - 1) * limit;
    
          const where = [];
          const values = [];
    
          if (localizacao && localizacao.trim() !== '') {
            where.push('a.agri_localizacao_propriedade LIKE ?');
            values.push(`%${localizacao}%`);
          }
          if (tipos_amendoim && tipos_amendoim.trim() !== '') {
            where.push('a.agri_tipos_amendoim_cultivados LIKE ?');
            values.push(`%${tipos_amendoim}%`);
          }
          if (certificacoes && certificacoes.trim() !== '') {
            where.push('a.agri_certificacoes LIKE ?');
            values.push(`%${certificacoes}%`);
          }
          if (outras_info && outras_info.trim() !== '') {
            where.push('a.agri_outras_informacoes LIKE ?');
            values.push(`%${outras_info}%`);
          }
    
          const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
          const selectSql =
            'SELECT ' +
            '  a.agri_id, ' +
            '  a.agri_localizacao_propriedade, ' +
            '  a.agri_tipos_amendoim_cultivados, ' +
            '  a.agri_certificacoes, ' +
            '  a.agri_outras_informacoes ' +
            'FROM AGRICULTORES a ' +
            whereSql +
            ' ORDER BY a.agri_id DESC ' +
            'LIMIT ? OFFSET ?';
    
          const countSql =
            'SELECT COUNT(*) AS total ' +
            'FROM AGRICULTORES a ' +
            whereSql;
    
          const [rows]   = await db.query(selectSql, [...values, limit, offset]);
          const [countR] = await db.query(countSql, values);
          const total = countR[0]?.total || 0;
    
          return res.status(200).json({
            sucesso: true,
            mensagem: 'Lista de agricultores (filtros)',
            pagina: page,
            limite: limit,
            total,
            itens: rows.length,
            dados: rows
          });
        } catch (error) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar agricultores', dados: error.message });
        }
      }
};