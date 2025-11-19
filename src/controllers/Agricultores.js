const db = require('../dataBase/connection'); 
const { gerarUrl} = require ('../utils/gerarUrl');

module.exports = {
    // Listagem de agricultores - RETORNA TODOS OS CAMPOS
    async listarAgricultores(request, response) {
        try {
            const sql = `
                SELECT
                    agri_id, 
                    agri_nome,
                    agri_localizacao_propriedade, 
                    agri_tipos_amendoim_cultivados, 
                    agri_certificacoes, 
                    agri_outras_informacoes,
                    agri_telefone,
                    agri_email,
                    agri_img
                FROM AGRICULTORES;
            `;

            const [rows] = await db.query(sql);
            const nRegistros = rows.length;

            const dados = rows.map(agricultores => ({
                ...agricultores,
                agri_img: gerarUrl(agricultores.agri_img, 'agricultores', 'padrao.jpg')
            }));

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Agricultores', 
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

    // Cadastro de agricultor - CORRIGIDO (faltava um campo no INSERT)
    async cadastrarAgricultores(request, response) {
        try {
            const { 
                agri_nome,
                agri_localizacao_propriedade, 
                agri_tipos_amendoim_cultivados, 
                agri_certificacoes, 
                agri_outras_informacoes,
                agri_telefone,
                agri_email,
                imagem 
            } = request.body;

            let imagemFinal = null;
            let urlImagem = null;

            if (request.file) {
                imagemFinal = request.file.filename;
                urlImagem = gerarUrl(imagemFinal, 'agricultores');
            } else if (imagem) {
                imagemFinal = imagem;
                urlImagem = imagem;
            } else {
                imagemFinal = 'padrao.jpg';
                urlImagem = gerarUrl('padrao.jpg', 'agricultores', 'padrao.jpg');
            }

            // SQL CORRIGIDO - agora com todos os campos
            const sql = `
                INSERT INTO AGRICULTORES 
                (agri_nome, agri_localizacao_propriedade, 
                 agri_tipos_amendoim_cultivados, 
                 agri_certificacoes, agri_outras_informacoes,
                 agri_telefone, agri_email, agri_img)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                agri_nome || '',
                agri_localizacao_propriedade || '', 
                agri_tipos_amendoim_cultivados || '', 
                agri_certificacoes || '', 
                agri_outras_informacoes || '',
                agri_telefone || '',
                agri_email || '',
                imagemFinal
            ];

            const [result] = await db.query(sql, values);

            const dados = {
                agri_id: result.insertId,
                agri_nome: agri_nome || '',
                agri_localizacao_propriedade: agri_localizacao_propriedade || '', 
                agri_tipos_amendoim_cultivados: agri_tipos_amendoim_cultivados || '', 
                agri_certificacoes: agri_certificacoes || '', 
                agri_outras_informacoes: agri_outras_informacoes || '',
                agri_telefone: agri_telefone || '',
                agri_email: agri_email || '',
                imagem: urlImagem
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Agricultor cadastrado com sucesso!', 
                dados: dados
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro no cadastro.', 
                dados: error.message
            });
        }
    }, 

    // Atualização de agricultor
    async editarAgricultores(request, response) {
        try {
            const { 
                agri_nome,
                agri_localizacao_propriedade, 
                agri_tipos_amendoim_cultivados, 
                agri_certificacoes, 
                agri_outras_informacoes,
                agri_telefone,
                agri_email 
            } = request.body;

            const { id } = request.params;

            const sql = `
                UPDATE AGRICULTORES SET
                    agri_nome = ?,
                    agri_localizacao_propriedade = ?, 
                    agri_tipos_amendoim_cultivados = ?, 
                    agri_certificacoes = ?, 
                    agri_outras_informacoes = ?,
                    agri_telefone = ?,
                    agri_email = ?
                WHERE agri_id = ?;
            `;

            const values = [ 
                agri_nome,
                agri_localizacao_propriedade, 
                agri_tipos_amendoim_cultivados, 
                agri_certificacoes, 
                agri_outras_informacoes,
                agri_telefone,
                agri_email,
                id 
            ];

            const [result] = await db.query(sql, values);

            if(result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Agricultor ${id} não encontrado!`,
                    dados: null
                })
            }

            const dados = {
                id,
                agri_nome,
                agri_localizacao_propriedade,
                agri_tipos_amendoim_cultivados,
                agri_certificacoes,
                agri_outras_informacoes,
                agri_telefone,
                agri_email
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: `Agricultor ${id} atualizado com sucesso!`, 
                dados
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na atualização.', 
                dados: error.message
            });
        }
    }, 

    // DELETE CORRIGIDO (estava usando agri_id em vez de id)
    async apagarAgricultores(request, response) {
        try {
            const { id } = request.params;

            const sql = `DELETE FROM AGRICULTORES WHERE agri_id = ?`;
            const values = [id];

            const [result] = await db.query(sql, values);

            if(result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Agricultor ${id} não encontrado!`,
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
                mensagem: 'Erro ao excluir agricultor.', 
                dados: error.message
            });
        }
    }, 

    // Filtro de agricultores - ATUALIZADO com todos os campos
    async listarAgricultoresFiltro(req, res) {
        try {
            const {
                localizacao, 
                tipos_amendoim, 
                certificacoes, 
                outras_info,
                nome
            } = req.query;

            const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
            const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
            const offset = (page - 1) * limit;

            const where = [];
            const values = [];

            if (nome && nome.trim() !== '') {
                where.push('a.agri_nome LIKE ?');
                values.push(`%${nome}%`);
            }
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

            // SELECT com TODOS os campos
            const selectSql =
                'SELECT ' +
                '  a.agri_id, ' +
                '  a.agri_nome, ' +
                '  a.agri_localizacao_propriedade, ' +
                '  a.agri_tipos_amendoim_cultivados, ' +
                '  a.agri_certificacoes, ' +
                '  a.agri_outras_informacoes, ' +
                '  a.agri_telefone, ' +
                '  a.agri_email, ' +
                '  a.agri_img ' +
                'FROM AGRICULTORES a ' +
                whereSql +
                ' ORDER BY a.agri_id DESC ' +
                'LIMIT ? OFFSET ?';

            const countSql =
                'SELECT COUNT(*) AS total ' +
                'FROM AGRICULTORES a ' +
                whereSql;

            const [rows] = await db.query(selectSql, [...values, limit, offset]);
            const [countR] = await db.query(countSql, values);
            const total = countR[0]?.total || 0;

            // Aplicar a geração de URL para as imagens
            const dados = rows.map(agricultor => ({
                ...agricultor,
                agri_img: gerarUrl(agricultor.agri_img, 'agricultores', 'padrao.jpg')
            }));

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Lista de agricultores (filtros)',
                pagina: page,
                limite: limit,
                total,
                itens: rows.length,
                dados: dados
            });
        } catch (error) {
            return res.status(500).json({ 
                sucesso: false, 
                mensagem: 'Erro ao listar agricultores', 
                dados: error.message 
            });
        }
    }
};