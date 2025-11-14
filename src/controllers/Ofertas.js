// Conexão com o banco de dados
const db = require('../dataBase/connection'); 
const { gerarUrl } = require('../../src/utils/gerarUrl');

// Funções auxiliares para validação de tipos
const isNum = (v) => v !== null && v !== '' && !Number.isNaN(Number(v));
const isNumPos = (v) => isNum(v) && Number(v) >= 0;
const isDate = (s) => !s || !Number.isNaN(Date.parse(s)); // Aceita vazio (sem alteração)

module.exports = {
    // Lista todas as ofertas
    async listarOfertas(request, response) {
        try {
            const sql = `
                SELECT oferta_id, OFERTAS.agri_id, OFERTAS.amen_id, oferta_quantidade, 
                oferta_preco, oferta_data_colheita, oferta_outras_informacoes, 
                oferta_data_publicacao, oferta_ativa, oferta_img 
                FROM OFERTAS
                INNER JOIN AGRICULTORES ON AGRICULTORES.agri_id = OFERTAS.agri_id
                INNER JOIN AMENDOINS ON AMENDOINS.amen_id = OFERTAS.amen_id;
                `;
            const [rows] = await db.query(sql);

            const nRegistros = rows.length;

            const dados = rows.map (ofertas => ({
                ...ofertas,
                oferta_img: gerarUrl(ofertas.oferta_img, 'ofertas', 'padrao.png')
            }))

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Ofertas', 
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
    // Cadastra uma nova oferta
    async cadastrarOfertas(request, response) {
        try {
            const { agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa } = request.body;
           
            // Monta instrução SQL para inserir oferta
            let imagemFinal = null;
            let urlImagem = null;

            if (request.file) {
        // Tem upload de arquivo
                imagemFinal = request.file.filename;
                urlImagem = gerarUrl(imagemFinal, 'ofertas');
            } else if (imagem) {
        // Tem URL no body - usa diretamente
                imagemFinal = imagem; // ← Isso deveria salvar a URL
                urlImagem = imagem;   // ← Mas você está salvando 'padrao.jpg' abaixo!
            } else {
        // Não tem upload nem URL - usa imagem padrão
                imagemFinal = 'padrao.jpg'; // ← AQUI ESTÁ O PROBLEMA!
                urlImagem = gerarUrl('padrao.jpg', 'ofertas', 'padrao.jpg');
            }



            const sql = `
             INSERT INTO OFERTAS (agri_id, amen_id, 
             oferta_quantidade, oferta_preco, oferta_data_colheita, 
             oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa, oferta_imagem) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa, imagem];
            const [result] = await db.query(sql, values);

            const dados = {
                inf_id: result.insertId,
                agri_id,
                amen_id,
                oferta_quantidade, 
                oferta_preco, 
                oferta_data_colheita,
                oferta_outras_informacoes, 
                oferta_data_publicacao, 
                oferta_ativa,
                imagem: urlImagem
            };
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Ofertas', 
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
    // Atualiza dinamicamente uma oferta (PATCH)
    async editarOfertas(request, response) {
        try {
            const { id } = request.params;
            const payload = request.body;
            const imagem = request.file ? request.file.filename : null;
            // Confere existência da oferta
            const [exist] = await db.query(
                'SELECT oferta_id, CAST(oferta_ativa AS UNSIGNED) AS oferta_ativa FROM OFERTAS WHERE oferta_id = ?',
                [id]
            );
            if (!exist.length) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Oferta ${id} não encontrada.`,
                    dados: null
                });
            }
            // Lista de campos permitidos para edição
            const permitidos = new Set([
                'agri_id',
                'amen_id',
                'oferta_quantidade',
                'oferta_preco',
                'oferta_data_colheita',
                'oferta_outras_informacoes',
                'oferta_data_publicacao',
                'oferta_ativa'
            ]);
            const sets = [];
            const values = [];
            // Validações dos campos editáveis enviados no PATCH
            // Garante que os valores estejam corretos antes de atualizar
            if (payload.oferta_quantidade !== undefined && !isNumPos(payload.oferta_quantidade)) {
                return response.status(422).json({ sucesso: false, mensagem: 'oferta_quantidade deve ser número >= 0.' });
            }
            if (payload.oferta_preco !== undefined && !isNumPos(payload.oferta_preco)) {
                return response.status(422).json({ sucesso: false, mensagem: 'oferta_preco deve ser número >= 0.' });
            }
            if (payload.oferta_data_colheita && !isDate(payload.oferta_data_colheita)) {
                return response.status(422).json({ sucesso: false, mensagem: 'oferta_data_colheita inválida.' });
            }
            if (payload.oferta_data_publicacao && !isDate(payload.oferta_data_publicacao)) {
                return response.status(422).json({ sucesso: false, mensagem: 'oferta_data_publicacao inválida.' });
            }
            if (payload.oferta_ativa !== undefined && ![0, 1, '0', '1', true, false].includes(payload.oferta_ativa)) {
                return response.status(422).json({ sucesso: false, mensagem: 'oferta_ativa deve ser 0/1 (ou booleano).' });
            }
            // Monta os campos para atualização dinâmica
            // Só atualiza campos permitidos e enviados
            for (const [k, v] of Object.entries(payload)) {
                if (permitidos.has(k) && v !== undefined) {
                    sets.push(`${k} = ?`);
                    values.push(v);
                }
            }
            // Se nenhum campo válido foi enviado, retorna erro
            if (!sets.length) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido para atualizar.',
                    dados: null
                });
            }
            let sqlUpdate, valuesUpdate;
            if (imagem) {
                sqlUpdate = `UPDATE OFERTAS SET oferta_imagem = ? WHERE oferta_id = ?`;
                valuesUpdate = [imagem, id];
                await db.query(sqlUpdate, valuesUpdate);
            }
            // Executa o update no banco de dados
            const sql = `UPDATE OFERTAS SET ${sets.join(', ')} WHERE oferta_id = ?`;
            values.push(id);
            const [result] = await db.query(sql, values);
            // Gera a URL pública da imagem
            const urlImagem = imagem ? gerarUrl(imagem, 'ofertas', 'padrao.jpg') : null;
            const dados = {
                oferta_id: id,
                ...payload,
                imagem: urlImagem
            };
            // Retorna resultado da operação
            return response.status(200).json({
                sucesso: true,
                mensagem: `Oferta ${id} atualizada com sucesso.`,
                linhas_afetadas: result.affectedRows,
                campos_alterados: sets.length,
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

    // Lista ofertas com base em filtros
    async listarOfertasFiltro(req, res) {
        try {
            const {
                agri_id,
                amen_id,
                min_quantidade,
                max_quantidade,
                min_preco,
                max_preco,
                de_colheita,
                ate_colheita,
                texto,   // busca em oferta_outras_informacoes
                ativa    // 0/1
            } = req.query;

            const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
            const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
            const offset = (page - 1) * limit;

            const where = [];
            const values = [];

            if (agri_id && !isNaN(agri_id)) {
                where.push('o.agri_id = ?');
                values.push(Number(agri_id));
            }
            if (amen_id && !isNaN(amen_id)) {
                where.push('o.amen_id = ?');
                values.push(Number(amen_id));
            }
            if (min_quantidade && !isNaN(min_quantidade)) {
                where.push('o.oferta_quantidade >= ?');
                values.push(Number(min_quantidade));
            }
            if (max_quantidade && !isNaN(max_quantidade)) {
                where.push('o.oferta_quantidade <= ?');
                values.push(Number(max_quantidade));
            }
            if (min_preco && !isNaN(min_preco)) {
                where.push('o.oferta_preco >= ?');
                values.push(Number(min_preco));
            }
            if (max_preco && !isNaN(max_preco)) {
                where.push('o.oferta_preco <= ?');
                values.push(Number(max_preco));
            }
            if (de_colheita && de_colheita.trim() !== '') {
                where.push('o.oferta_data_colheita >= ?');
                values.push(de_colheita);
            }
            if (ate_colheita && ate_colheita.trim() !== '') {
                where.push('o.oferta_data_colheita <= ?');
                values.push(ate_colheita);
            }
            if (texto && texto.trim() !== '') {
                where.push('o.oferta_outras_informacoes LIKE ?');
                values.push(`%${texto}%`);
            }
            if (ativa !== undefined && ativa !== '') {
                where.push('(o.oferta_ativa + 0) = ?');
                values.push(Number(ativa) ? 1 : 0);
            }

            const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

            const selectSql =
                'SELECT ' +
                '  o.oferta_id, ' +
                '  o.agri_id, ' +
                '  o.amen_id, ' +
                '  o.oferta_quantidade, ' +
                '  o.oferta_preco, ' +
                '  o.oferta_data_colheita, ' +
                '  o.oferta_outras_informacoes, ' +
                '  o.oferta_data_publicacao, ' +
                '  (o.oferta_ativa + 0) AS oferta_ativa ' +
                'FROM OFERTAS o ' +
                whereSql +
                ' ORDER BY o.oferta_id DESC ' +
                'LIMIT ? OFFSET ?';

            const countSql =
                'SELECT COUNT(*) AS total ' +
                'FROM OFERTAS o ' +
                whereSql;

            const [rows]   = await db.query(selectSql, [...values, limit, offset]);
            const [countR] = await db.query(countSql, values);
            const total = countR[0]?.total || 0;

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Lista de ofertas (filtros)',
                pagina: page,
                limite: limit,
                total,
                itens: rows.length,
                dados: rows
            });
        } catch (error) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar ofertas',
                dados: error.message
            });
        }
    },

    // Lista ofertas em destaque
    async listarDestaques(req, res) {
        try {
            const sql =
                'SELECT ' +
                '  o.oferta_id, ' +
                '  o.agri_id, ' +
                '  o.amen_id, ' +
                '  o.oferta_quantidade, ' +
                '  o.oferta_preco, ' +
                '  o.oferta_data_colheita, ' +
                '  o.oferta_outras_informacoes, ' +
                '  o.oferta_data_publicacao ' +
                'FROM OFERTAS o ' +
                'WHERE (o.oferta_ativa + 0) = 1 ' +
                'ORDER BY RAND() ' +
                'LIMIT 3';

            const [rows] = await db.query(sql);

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Destaques de ofertas (ativas)',
                itens: rows.length,
                dados: rows
            });
        } catch (error) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar destaques',
                dados: error.message
            });
        }
    },

    // Remove uma oferta
    async apagarOfertas(request, response) {
        try {
            const { id } = request.params;
            // Verifica existência
            const [rows] = await db.query('SELECT oferta_id FROM OFERTAS WHERE oferta_id = ?', [id]);
            if (!rows.length) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Oferta ${id} não encontrada`,
                });
            }
            const sql = 'DELETE FROM OFERTAS WHERE oferta_id = ?';
            const [result] = await db.query(sql, [id]);
            return response.status(200).json({
                sucesso: true,
                mensagem: `Oferta ${id} excluída com sucesso`,
                dados: null
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    }
};