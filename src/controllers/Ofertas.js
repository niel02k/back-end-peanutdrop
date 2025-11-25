// Conexão com o banco de dados
const db = require('../dataBase/connection'); 
const { gerarUrl } = require('../../src/utils/gerarUrl');

// Funções auxiliares para validação de tipos
const isNum = (v) => v !== null && v !== '' && !Number.isNaN(Number(v));
const isNumPos = (v) => isNum(v) && Number(v) >= 0;
const isDate = (s) => !s || !Number.isNaN(Date.parse(s));

module.exports = {
    // Lista todas as ofertas
    async listarOfertas(request, response) {
        try {
            const sql = `
                SELECT oferta_id, OFERTAS.agri_id, OFERTAS.amen_id, oferta_quantidade, 
                oferta_preco, oferta_data_colheita, oferta_outras_informacoes, 
                oferta_data_publicacao, oferta_ativa, oferta_img , AGRICULTORES.agri_nome, AMENDOINS.amen_variedade
                FROM OFERTAS
                INNER JOIN AGRICULTORES ON AGRICULTORES.agri_id = OFERTAS.agri_id
                INNER JOIN AMENDOINS ON AMENDOINS.amen_id = OFERTAS.amen_id;
            `;
            const [rows] = await db.query(sql);
            const nRegistros = rows.length;

            // ✅ CORREÇÃO: Normalizar URL igual ao perfil
            const normalizarUrlImagem = (urlOuNome) => {
                if (!urlOuNome) return null;
                
                if (urlOuNome.includes('://')) {
                    if (urlOuNome.includes('/public/ofertas/')) {
                        const nomeArquivo = urlOuNome.split('/').pop();
                        return `http://localhost:3333/uploads/ofertas/${nomeArquivo}`;
                    }
                    return urlOuNome;
                }
                
                return `http://localhost:3333/uploads/ofertas/${urlOuNome}`;
            };

            const dados = rows.map(oferta => ({
                ...oferta,
                // ✅ USA A MESMA LÓGICA DO PERFIL
                oferta_img: normalizarUrlImagem(oferta.oferta_img) || 
                           gerarUrl(oferta.oferta_img, 'ofertas', 'padrao.png')
            }));

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
        console.log('\n🔵 ========== INICIANDO CADASTRO OFERTA ==========');
        
        try {
            // 🔍 DEBUG DO MULTER
            console.log('📥 REQ.FILE (MULTER):', request.file);
            console.log('📥 REQ.BODY:', request.body);

            const { 
                agri_id, 
                amen_id, 
                oferta_quantidade, 
                oferta_preco, 
                oferta_data_colheita, 
                oferta_outras_informacoes = '',
                oferta_data_publicacao,
                oferta_ativa = '1' 
            } = request.body;

            // ✅ CORREÇÃO: Processa a imagem IGUAL ao demandas
            let imagemFinal = null;
            let urlImagem = null;

            if (request.file) {
                // Tem upload de arquivo
                imagemFinal = request.file.filename;
                urlImagem = gerarUrl(imagemFinal, 'ofertas', 'padrao.png');
                console.log('📁 Arquivo salvo:', imagemFinal);
                console.log('🌐 URL gerada:', urlImagem);
            } else {
                // Sem imagem - usa o padrão
                imagemFinal = null;
                urlImagem = gerarUrl(null, 'ofertas', 'padrao.png');
                console.log('📁 Nenhuma imagem enviada, usando padrão');
            }

            // ✅ CORREÇÃO PARA BIT: Converter para 0 ou 1 (números)
            const ativaBit = (oferta_ativa === '1' || oferta_ativa === 1 || oferta_ativa === true) ? 1 : 0;

            console.log('📋 Dados finais:', {
                agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita,
                oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa: ativaBit, 
                imagemBD: imagemFinal,
                imagemURL: urlImagem
            });

            // Validações
            if (!agri_id || !amen_id || !oferta_quantidade || !oferta_preco || !oferta_data_colheita) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios faltando'
                });
            }

            // ✅ CORREÇÃO: SQL corrigido - campo é oferta_img (não oferta_imagem)
            const sql = `
                INSERT INTO OFERTAS (
                    agri_id, amen_id, oferta_quantidade, oferta_preco, 
                    oferta_data_colheita, oferta_outras_informacoes, 
                    oferta_data_publicacao, oferta_ativa, oferta_img
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // ✅ CORREÇÃO: Valores convertidos corretamente
            const values = [
                parseInt(agri_id), 
                parseInt(amen_id), 
                parseFloat(oferta_quantidade), 
                parseFloat(oferta_preco), 
                oferta_data_colheita, 
                oferta_outras_informacoes,
                oferta_data_publicacao, 
                ativaBit, 
                imagemFinal // ✅ CORRETO: imagemFinal (não 'imagem')
            ];

            console.log('🚀 Executando SQL...');
            const [result] = await db.query(sql, values);
            console.log('✅ Oferta cadastrada! ID:', result.insertId);

            const dados = {
                oferta_id: result.insertId,
                agri_id: parseInt(agri_id),
                amen_id: parseInt(amen_id),
                oferta_quantidade: parseFloat(oferta_quantidade), 
                oferta_preco: parseFloat(oferta_preco), 
                oferta_data_colheita,
                oferta_outras_informacoes, 
                oferta_data_publicacao, 
                oferta_ativa: ativaBit,
                oferta_img: urlImagem // ✅ CORRETO: retorna URL completa
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Oferta cadastrada com sucesso!', 
                dados: dados
            });

        } catch (error) {
            console.error('❌ ERRO:', error);
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro interno: ' + error.message, 
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

            // ✅ CORREÇÃO: Converter valores para tipos corretos
            const normaliza = (campo, val) => {
                if (val === null || val === undefined) return val;
                if (['oferta_quantidade', 'oferta_preco', 'agri_id', 'amen_id'].includes(campo)) return Number(val);
                if (campo === 'oferta_ativa') return Number(val);
                if (['oferta_data_colheita', 'oferta_data_publicacao'].includes(campo)) {
                    try { return new Date(val).toISOString().slice(0, 10); } catch { return String(val); }
                }
                return String(val);
            };

            // Validações dos campos editáveis
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

            // Buscar estado atual para diff
            const [atualRows] = await db.query('SELECT * FROM OFERTAS WHERE oferta_id = ?', [id]);
            const atual = atualRows[0];

            // Monta os campos para atualização dinâmica
            for (const [k, v] of Object.entries(payload)) {
                if (permitidos.has(k) && v !== undefined) {
                    const novo = normaliza(k, v);
                    const antigo = normaliza(k, atual[k]);
                    
                    // Só atualiza se realmente mudou
                    if (novo !== antigo) {
                        sets.push(`${k} = ?`);
                        values.push(v);
                    }
                }
            }

            // Se imagem foi enviada, adiciona ao update
            if (imagem) {
                sets.push('oferta_img = ?');
                values.push(imagem);
            }

            // Se nenhum campo válido foi enviado, retorna erro
            if (!sets.length) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido para atualizar.',
                    dados: null
                });
            }

            // Executa o update no banco de dados
            const sql = `UPDATE OFERTAS SET ${sets.join(', ')} WHERE oferta_id = ?`;
            values.push(id);
            const [result] = await db.query(sql, values);

            // Gera a URL pública da imagem
            const urlImagem = imagem ? gerarUrl(imagem, 'ofertas', 'padrao.png') : null;

            const dados = {
                oferta_id: parseInt(id),
                ...payload,
                oferta_img: urlImagem
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
            console.error('❌ ERRO:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    async listarOfertasPorId(req, res) {
        try {
            const { id } = req.params;

            const sql = `
                SELECT 
                    o.oferta_id,
                    o.agri_id,
                    o.amen_id,
                    o.oferta_quantidade,
                    o.oferta_preco,
                    o.oferta_data_colheita,
                    o.oferta_outras_informacoes,
                    o.oferta_data_publicacao,
                    o.oferta_img,
                    ag.agri_nome,
                    am.amen_variedade,
                    (o.oferta_ativa + 0) AS oferta_ativa
                FROM OFERTAS o
                JOIN AGRICULTORES ag ON ag.agri_id = o.agri_id
                JOIN AMENDOINS am ON am.amen_id = o.amen_id
                WHERE o.oferta_id = ?
                LIMIT 1;
            `;

            const [rows] = await db.query(sql, [id]);

            if (rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: `Oferta ${id} não encontrada`,
                    dados: null
                });
            }

            const oferta = rows[0];

            // ✅ CORREÇÃO: Normalizar URL igual ao listarOfertas
            const normalizarUrlImagem = (urlOuNome) => {
                if (!urlOuNome) return null;
                
                if (urlOuNome.includes('://')) {
                    if (urlOuNome.includes('/public/ofertas/')) {
                        const nomeArquivo = urlOuNome.split('/').pop();
                        return `http://localhost:3333/uploads/ofertas/${nomeArquivo}`;
                    }
                    return urlOuNome;
                }
                
                return `http://localhost:3333/uploads/ofertas/${urlOuNome}`;
            };

            oferta.oferta_img = normalizarUrlImagem(oferta.oferta_img) || 
                               gerarUrl(oferta.oferta_img, 'ofertas', 'padrao.png');

            return res.status(200).json({
                sucesso: true,
                mensagem: `Detalhes da oferta ${id}`,
                dados: oferta
            });

        } catch (error) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao buscar oferta por ID',
                dados: error.message
            });
        }
    },
    
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
    },
};