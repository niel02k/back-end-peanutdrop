const db = require('../dataBase/connection'); 

module.exports = {
    // Listagem de negociações
    async listarNegociacoes(request, response) {
        try {
          const sql = `
            SELECT 
                n.negoc_id, 
                n.oferta_id, 
                n.demanda_id,
                n.agri_id,
                n.emp_id,
                n.negoc_status,
                n.negoc_data_criacao,
                a.agri_nome,
                a.agri_localizacao_propriedade,
                e.emp_nome_fantasia,
                e.emp_razao_social,
                o.oferta_quantidade,
                o.oferta_preco,
                o.oferta_data_colheita,
                am.amen_variedade,
                d.demanda_quantidade,
                d.demanda_preco_maximo,
                d.demanda_data_entrega
            FROM NEGOCIACOES n
            LEFT JOIN AGRICULTORES a ON n.agri_id = a.agri_id
            LEFT JOIN EMPRESAS e ON n.emp_id = e.emp_id
            LEFT JOIN OFERTAS o ON n.oferta_id = o.oferta_id
            LEFT JOIN AMENDOINS am ON o.amen_id = am.amen_id
            LEFT JOIN DEMANDAS d ON n.demanda_id = d.demanda_id
            ORDER BY n.negoc_data_criacao DESC
          `;
          const [rows] = await db.query(sql);
          const nRegistros = rows.length;
          
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de negociacoes', 
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
    
    // INICIAR NEGOCIAÇÃO (Empresa inicia a partir de oferta)
    async iniciarNegociacaoOferta(request, response) {
        try {
            const {
                oferta_id,
                emp_id
            } = request.body;

            // Buscar dados da oferta para obter agri_id
            const sqlOferta = `SELECT agri_id FROM OFERTAS WHERE oferta_id = ?`;
            const [oferta] = await db.query(sqlOferta, [oferta_id]);

            if (oferta.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Oferta não encontrada.',
                    dados: null
                });
            }

            const agri_id = oferta[0].agri_id;

            const sql = `
                INSERT INTO NEGOCIACOES 
                (oferta_id, demanda_id, agri_id, emp_id, negoc_status, negoc_data_criacao) 
                VALUES (?, NULL, ?, ?, 1, NOW())
            `;

            const values = [oferta_id, agri_id, emp_id];

            const [result] = await db.query(sql, values);

            const dados = {
                negoc_id: result.insertId,
                oferta_id: oferta_id,
                agri_id: agri_id,
                emp_id: emp_id,
                status: 1
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Negociação iniciada com sucesso!',
                dados: dados
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao iniciar negociação.',
                dados: error.message
            });
        }
    },

    // INICIAR NEGOCIAÇÃO (Agricultor inicia a partir de demanda)
    async iniciarNegociacaoDemanda(request, response) {
        try {
            const {
                demanda_id,
                agri_id
            } = request.body;

            // Buscar dados da demanda para obter emp_id
            const sqlDemanda = `SELECT emp_id FROM DEMANDAS WHERE demanda_id = ?`;
            const [demanda] = await db.query(sqlDemanda, [demanda_id]);

            if (demanda.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Demanda não encontrada.',
                    dados: null
                });
            }

            const emp_id = demanda[0].emp_id;

            const sql = `
                INSERT INTO NEGOCIACOES 
                (oferta_id, demanda_id, agri_id, emp_id, negoc_status, negoc_data_criacao) 
                VALUES (NULL, ?, ?, ?, 1, NOW())
            `;

            const values = [demanda_id, agri_id, emp_id];

            const [result] = await db.query(sql, values);

            const dados = {
                negoc_id: result.insertId,
                demanda_id: demanda_id,
                agri_id: agri_id,
                emp_id: emp_id,
                status: 1
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Negociação iniciada com sucesso!',
                dados: dados
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao iniciar negociação.',
                dados: error.message
            });
        }
    },
    
    // Atualização de negociação
    async editarNegociacoes(request, response) {
        try {
            const { id } = request.params;
            const { status } = request.body;

            const sql = `
                UPDATE NEGOCIACOES
                SET negoc_status = ?
                WHERE negoc_id = ?
            `;

            const values = [status, id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Negociação não encontrada para atualização.',
                    dados: null
                });
            }

            const dados = {
                id,
                status
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: `Negociação ${id} atualizada com sucesso`,
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
    
    async apagarNegociacoes(request, response) {
        try {
            const { id } = request.params;

            const sql = `DELETE FROM negociacoes WHERE negoc_id = ?`;
            const values = [id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Negociação ${id} não encontrada.`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Negociação ${id} excluída com sucesso.`,
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

    // Listagem com filtros + paginação + total
    async listarNegociacoesFiltro(req, res) {
        try {
            const { negoc_status, oferta_id, demanda_id, agri_id, emp_id } = req.query;

            const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
            const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
            const offset = (page - 1) * limit;

            const where = [];
            const values = [];

            if (negoc_status !== undefined && String(negoc_status).trim() !== '') {
                where.push('n.negoc_status = ?');
                values.push(Number(negoc_status));
            }
            if (oferta_id !== undefined && String(oferta_id).trim() !== '' && !isNaN(oferta_id)) {
                where.push('n.oferta_id = ?');
                values.push(Number(oferta_id));
            }
            if (demanda_id !== undefined && String(demanda_id).trim() !== '' && !isNaN(demanda_id)) {
                where.push('n.demanda_id = ?');
                values.push(Number(demanda_id));
            }
            if (agri_id !== undefined && String(agri_id).trim() !== '' && !isNaN(agri_id)) {
                where.push('n.agri_id = ?');
                values.push(Number(agri_id));
            }
            if (emp_id !== undefined && String(emp_id).trim() !== '' && !isNaN(emp_id)) {
                where.push('n.emp_id = ?');
                values.push(Number(emp_id));
            }

            const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

            const selectSql = `
                SELECT 
                    n.negoc_id, 
                    n.oferta_id, 
                    n.demanda_id,
                    n.agri_id,
                    n.emp_id,
                    n.negoc_status,
                    n.negoc_data_criacao,
                    a.agri_nome,
                    e.emp_nome_fantasia,
                    o.oferta_quantidade,
                    o.oferta_preco,
                    am.amen_variedade,
                    d.demanda_quantidade,
                    d.demanda_preco_maximo
                FROM NEGOCIACOES n
                LEFT JOIN AGRICULTORES a ON n.agri_id = a.agri_id
                LEFT JOIN EMPRESAS e ON n.emp_id = e.emp_id
                LEFT JOIN OFERTAS o ON n.oferta_id = o.oferta_id
                LEFT JOIN AMENDOINS am ON o.amen_id = am.amen_id
                LEFT JOIN DEMANDAS d ON n.demanda_id = d.demanda_id
                ${whereSql}
                ORDER BY n.negoc_data_criacao DESC
                LIMIT ? OFFSET ?
            `;

            const countSql = `
                SELECT COUNT(*) AS total 
                FROM NEGOCIACOES n
                ${whereSql}
            `;

            const [rows]   = await db.query(selectSql, [...values, limit, offset]);
            const [countR] = await db.query(countSql, values);
            const total = countR[0]?.total || 0;

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Lista de negociações (filtros)',
                pagina: page,
                limite: limit,
                total,
                itens: rows.length,
                dados: rows
            });
        } catch (error) {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar negociações',
                dados: error.message
            });
        }
    },

    // Buscar negociação específica por ID
    async buscarNegociacaoPorId(request, response) {
        try {
            const { id } = request.params;

            const sql = `
                SELECT 
                    n.negoc_id, 
                    n.oferta_id, 
                    n.demanda_id,
                    n.agri_id,
                    n.emp_id,
                    n.negoc_status,
                    n.negoc_data_criacao,
                    a.agri_nome,
                    a.agri_telefone,
                    a.agri_email,
                    a.agri_localizacao_propriedade,
                    e.emp_nome_fantasia,
                    e.emp_telefone,
                    e.emp_email,
                    o.oferta_quantidade,
                    o.oferta_preco,
                    o.oferta_data_colheita,
                    o.oferta_outras_informacoes,
                    am.amen_variedade,
                    am.amen_tamanho,
                    am.amen_outras_caracteristicas,
                    d.demanda_quantidade,
                    d.demanda_preco_maximo,
                    d.demanda_data_entrega,
                    d.demanda_outras_informacoes
                FROM NEGOCIACOES n
                LEFT JOIN AGRICULTORES a ON n.agri_id = a.agri_id
                LEFT JOIN EMPRESAS e ON n.emp_id = e.emp_id
                LEFT JOIN OFERTAS o ON n.oferta_id = o.oferta_id
                LEFT JOIN AMENDOINS am ON o.amen_id = am.amen_id
                LEFT JOIN DEMANDAS d ON n.demanda_id = d.demanda_id
                WHERE n.negoc_id = ?
            `;

            const [rows] = await db.query(sql, [id]);

            if (rows.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Negociação não encontrada.',
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Negociação encontrada.',
                dados: rows[0]
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao buscar negociação.',
                dados: error.message
            });
        }
    },

    // Listar negociações por usuário (empresa ou agricultor)
    async listarNegociacoesPorUsuario(request, response) {
        try {
            const { usuario_id, tipo_usuario } = request.params;

            let whereCondition = '';
            let value = '';

            if (tipo_usuario === 'empresa') {
                whereCondition = 'n.emp_id = ?';
                value = usuario_id;
            } else if (tipo_usuario === 'agricultor') {
                whereCondition = 'n.agri_id = ?';
                value = usuario_id;
            } else {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Tipo de usuário inválido. Use "empresa" ou "agricultor".',
                    dados: null
                });
            }

            const sql = `
                SELECT 
                    n.negoc_id, 
                    n.oferta_id, 
                    n.demanda_id,
                    n.agri_id,
                    n.emp_id,
                    n.negoc_status,
                    n.negoc_data_criacao,
                    a.agri_nome,
                    e.emp_nome_fantasia,
                    o.oferta_quantidade,
                    o.oferta_preco,
                    am.amen_variedade,
                    d.demanda_quantidade,
                    d.demanda_preco_maximo
                FROM NEGOCIACOES n
                LEFT JOIN AGRICULTORES a ON n.agri_id = a.agri_id
                LEFT JOIN EMPRESAS e ON n.emp_id = e.emp_id
                LEFT JOIN OFERTAS o ON n.oferta_id = o.oferta_id
                LEFT JOIN AMENDOINS am ON o.amen_id = am.amen_id
                LEFT JOIN DEMANDAS d ON n.demanda_id = d.demanda_id
                WHERE ${whereCondition}
                ORDER BY n.negoc_data_criacao DESC
            `;

            const [rows] = await db.query(sql, [value]);

            return response.status(200).json({
                sucesso: true,
                mensagem: `Negociações do ${tipo_usuario}`,
                nRegistros: rows.length,
                dados: rows
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao buscar negociações do usuário.',
                dados: error.message
            });
        }
    }
};