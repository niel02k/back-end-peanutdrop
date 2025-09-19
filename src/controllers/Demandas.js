const db = require('../dataBase/connection'); 

module.exports = {
    async listarDemandas(request, response) {
        try {

            const sql = `
            SELECT
                demanda_id, emp_id, amen_id, demanda_quantidade, demanda_preco_maximo,
                demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa = 1 AS usu_ativo
            FROM DEMANDAS;
                        `;
            
            const [rows] = await db.query(sql);

            const nRegistros = rows.length;

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de Demandas', 
                resultado: nRegistros,
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
    async cadastrarDemandas(request, response) {
        try {

            const {emp_id, amen_id, quantidade, preco_maximo, data_entrega, informacoes, data_publi, ativa} = request.body;

            //instruções sql
            const sql = `
                INSERT INTO DEMANDAS
                    (emp_id, amen_id, demanda_quantidade, demanda_preco_maximo, demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa) 
                VALUES
                    (?, ?, ? ,? ,? ,? ,? ,?);
            `;

            const values = [emp_id, amen_id, quantidade, preco_maximo, data_entrega, informacoes, data_publi, ativa];
            
            const [result] = await db.query(sql, values);

            const dados= {
                emp_id,
                amen_id,
                quantidade,
                preco_maximo,
                data_entrega,
                informacoes,
                data_publi,
                ativa
            };

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de Demandas', 
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
    async editarDemandas(request, response) {
        try {
            const id = request.params.id;
    
            const {
                emp_id,
                amen_id,
                quantidade,
                preco_maximo,
                data_entrega,
                informacoes,
                data_publi,
                ativa
            } = request.body;
    
            const sql = `
                UPDATE DEMANDAS
                SET
                    emp_id = ?,
                    amen_id = ?,
                    demanda_quantidade = ?,
                    demanda_preco_maximo = ?,
                    demanda_data_entrega = ?,
                    demanda_outras_informacoes = ?,
                    demanda_data_publicacao = ?,
                    demanda_ativa = ?
                WHERE
                    demanda_id = ?
            `;
    
            const values = [
                emp_id,
                amen_id,
                quantidade,
                preco_maximo,
                data_entrega,
                informacoes,
                data_publi,
                ativa,
                id
            ];
    
            const [rows] = await db.query(sql, values);
    
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Alteração no cadastro de Demandas',
                dados: rows // <- aqui vem affectedRows, changedRows, etc.
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    
    async apagarDemandas(request, response) {
        try {
            const { id } = request.params;
    
            const sql = `DELETE FROM demandas WHERE demanda_id = ?`; // coloque entre crases
    
            const values = [id];
    
            const [result] = await db.query(sql, values);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Demanda ${id} não encontrada`, // corrigido: template string e nome da variável
                });
            }
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Demanda ${id} excluída com sucesso`,
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
    async listarDemandasFiltro(req, res) {
        try {
          const {
            emp_id, amen_id, min_quantidade, max_quantidade, min_preco, max_preco, de_entrega, ate_entrega, texto, ativa
          } = req.query;
    
          const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
          const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
          const offset = (page - 1) * limit;
    
          const where = [];
          const values = [];
    
          if (emp_id && !isNaN(emp_id)) {
            where.push('d.emp_id = ?');
            values.push(Number(emp_id));
          }
          if (amen_id && !isNaN(amen_id)) {
            where.push('d.amen_id = ?');
            values.push(Number(amen_id));
          }
          if (min_quantidade && !isNaN(min_quantidade)) {
            where.push('d.demanda_quantidade >= ?');
            values.push(Number(min_quantidade));
          }
          if (max_quantidade && !isNaN(max_quantidade)) {
            where.push('d.demanda_quantidade <= ?');
            values.push(Number(max_quantidade));
          }
          if (min_preco && !isNaN(min_preco)) {
            where.push('d.demanda_preco_maximo >= ?');
            values.push(Number(min_preco));
          }
          if (max_preco && !isNaN(max_preco)) {
            where.push('d.demanda_preco_maximo <= ?');
            values.push(Number(max_preco));
          }
          if (de_entrega && de_entrega.trim() !== '') {
            where.push('d.demanda_data_entrega >= ?');
            values.push(de_entrega);
          }
          if (ate_entrega && ate_entrega.trim() !== '') {
            where.push('d.demanda_data_entrega <= ?');
            values.push(ate_entrega);
          }
          if (texto && texto.trim() !== '') {
            where.push('d.demanda_outras_informacoes LIKE ?');
            values.push(`%${texto}%`);
          }
          if (ativa !== undefined && ativa !== '') {
            where.push('(d.demanda_ativa + 0) = ?');
            values.push(Number(ativa) ? 1 : 0);
          }
    
          const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
          const selectSql =
            'SELECT ' +
            '  d.demanda_id, ' +
            '  d.emp_id, ' +
            '  d.amen_id, ' +
            '  d.demanda_quantidade, ' +
            '  d.demanda_preco_maximo, ' +
            '  d.demanda_data_entrega, ' +
            '  d.demanda_outras_informacoes, ' +
            '  d.demanda_data_publicacao, ' +
            '  (d.demanda_ativa + 0) AS demanda_ativa ' +
            'FROM DEMANDAS d ' +
            whereSql +
            ' ORDER BY d.demanda_id DESC ' +
            'LIMIT ? OFFSET ?';
    
          const countSql =
            'SELECT COUNT(*) AS total ' +
            'FROM DEMANDAS d ' +
            whereSql;
    
          const [rows]   = await db.query(selectSql, [...values, limit, offset]);
          const [countR] = await db.query(countSql, values);
          const total = countR[0]?.total || 0;
    
          return res.status(200).json({
            sucesso: true,
            mensagem: 'Lista de demandas (filtros)',
            pagina: page,
            limite: limit,
            total,
            itens: rows.length,
            dados: rows
          });
        } catch (error) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar demandas', dados: error.message });
        }
      }
};