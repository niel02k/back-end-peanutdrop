const db = require('../dataBase/connection');
const { gerarUrl } = require('../../src/utils/gerarUrl');

// utils simples
const isNum = (v) => v !== null && v !== '' && !Number.isNaN(Number(v));
const isNumPos = (v) => isNum(v) && Number(v) >= 0;
const isDate = (s) => !s || !Number.isNaN(Date.parse(s));

module.exports = {
  async listarDemandas(request, response) {
    try {
      const sql = `
        SELECT
          dm.demanda_id, dm.emp_id, emp.emp_nome_fantasia, dm.amen_id, am.amen_variedade, 
          dm.demanda_quantidade, dm.demanda_preco_maximo, dm.demanda_data_entrega, 
          dm.demanda_outras_informacoes, dm.demanda_data_publicacao, dm.demanda_imagem, 
          dm.demanda_ativa = 1 AS demanda_ativa
        FROM DEMANDAS dm  
        INNER JOIN empresas emp ON dm.emp_id = emp.emp_id 
        INNER JOIN amendoins am ON dm.amen_id = am.amen_id;
      `;

      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      // ✅ CORREÇÃO: Normalizar URL igual ao perfil
      const normalizarUrlImagem = (urlOuNome) => {
        if (!urlOuNome) return null;
        
        if (urlOuNome.includes('://')) {
          if (urlOuNome.includes('/public/demandas/')) {
            const nomeArquivo = urlOuNome.split('/').pop();
            return `http://localhost:3333/uploads/demandas/${nomeArquivo}`;
          }
          return urlOuNome;
        }
        
        return `http://localhost:3333/uploads/demandas/${urlOuNome}`;
      };

      const dados = rows.map(demanda => ({
        ...demanda,
        // ✅ USA A MESMA LÓGICA DO PERFIL
        demanda_imagem: normalizarUrlImagem(demanda.demanda_imagem) || 
                       gerarUrl(demanda.demanda_imagem, 'demandas', 'padrao.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Demandas',
        nRegistros,
        dados,
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
    console.log('\n🔵 ========== INICIANDO CADASTRO DEMANDA ==========');
    
    try {
      // 🔍 DEBUG ESPECÍFICO DO MULTER
      console.log('📥 REQ.FILE (MULTER):', request.file);
      console.log('📥 REQ.BODY:', request.body);
      console.log('📥 Headers - Content-Type:', request.headers['content-type']);

      // 🔍 VERIFICAÇÃO DO PROBLEMA
      if (!request.file) {
        console.log('\n❌ ========== MULTER NÃO PROCESSOU ARQUIVO ==========');
        console.log('🔍 Investigando causas...');
        
        // Verifica se a requisição é multipart
        const isMultipart = request.is('multipart/form-data');
        console.log('   ✅ É multipart/form-data?', isMultipart);
        
        // Verifica headers
        console.log('   ✅ Content-Type header:', request.headers['content-type']);
        console.log('   ✅ Content-Length header:', request.headers['content-length']);
        
        console.log('❌ O arquivo não chegou ao Multer');
        console.log('💡 Possíveis soluções:');
        console.log('   1. Verifique se o fieldname no frontend é "imagem"');
        console.log('   2. Verifique se o arquivo é uma imagem válida');
        console.log('   3. Verifique o console do navegador para ver o FormData');
        console.log('================================================\n');
      } else {
        console.log('\n✅ ========== MULTER PROCESSOU ARQUIVO ==========');
        console.log('✅ Arquivo recebido:', {
          fieldname: request.file.fieldname,
          originalname: request.file.originalname, 
          filename: request.file.filename,
          size: request.file.size,
          mimetype: request.file.mimetype
        });
        console.log('==============================================\n');
      }

      // Extrai os dados do body
      const { 
        emp_id, 
        amen_id, 
        quantidade, 
        preco_maximo, 
        data_entrega, 
        informacoes = '',
        data_publi,
        ativa = '1'
      } = request.body;

      // Processa a imagem
      let imagemFinal = null;
      let urlImagem = null;

      if (request.file) {
        imagemFinal = request.file.filename;
        urlImagem = gerarUrl(imagemFinal, 'demandas', 'padrao.png');
        console.log('📁 Imagem salva no banco:', imagemFinal);
      } else {
        imagemFinal = null;
        urlImagem = gerarUrl(null, 'demandas', 'padrao.png');
        console.log('📁 Usando imagem padrão');
      }

      const ativaBit = (ativa === '1' || ativa === 1 || ativa === true) ? 1 : 0;

      // Resto do código igual...
      const sql = `
        INSERT INTO DEMANDAS (
          emp_id, amen_id, demanda_quantidade, demanda_preco_maximo, 
          demanda_data_entrega, demanda_outras_informacoes, 
          demanda_data_publicacao, demanda_ativa, demanda_imagem
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const values = [
        parseInt(emp_id), parseInt(amen_id), parseFloat(quantidade), 
        parseFloat(preco_maximo), data_entrega, informacoes,
        data_publi, ativaBit, imagemFinal
      ];

      console.log('🚀 Executando SQL...');
      const [rows] = await db.query(sql, values);
      console.log('✅ Demanda cadastrada! ID:', rows.insertId);

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Demanda cadastrada com sucesso!',
        dados: {
          demanda_id: rows.insertId,
          emp_id: parseInt(emp_id),
          amen_id: parseInt(amen_id),
          quantidade: parseFloat(quantidade),
          preco_maximo: parseFloat(preco_maximo),
          data_entrega,
          informacoes,
          data_publi,
          ativa: ativaBit,
          imagem: urlImagem
        }
      });

    } catch (error) {
      console.error('❌ ERRO:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno: ' + error.message
      });
    }
  },

  async editarDemandas(request, response) {
    try {
      const { id } = request.params;

      // Aceita tanto nomes curtos quanto nomes de coluna
      const payloadOriginal = request.body || {};
      const payload = { ...payloadOriginal };

      // Mapear nomes curtos -> colunas reais (sem sobrescrever se já vieram certos)
      const map = {
        quantidade: 'demanda_quantidade',
        preco_maximo: 'demanda_preco_maximo',
        data_entrega: 'demanda_data_entrega',
        informacoes: 'demanda_outras_informacoes',
        data_publi: 'demanda_data_publicacao',
        ativa: 'demanda_ativa'
      };
      for (const [curto, coluna] of Object.entries(map)) {
        if (payload[curto] !== undefined && payload[coluna] === undefined) {
          payload[coluna] = payload[curto];
          delete payload[curto];
        }
      }

      // Buscar estado atual
      const [rows] = await db.query(`
        SELECT
          demanda_id,
          emp_id,
          amen_id,
          demanda_quantidade,
          demanda_preco_maximo,
          demanda_data_entrega,
          demanda_outras_informacoes,
          demanda_data_publicacao,
          CAST(demanda_ativa AS UNSIGNED) AS demanda_ativa
        FROM DEMANDAS
        WHERE demanda_id = ?
      `, [id]);

      if (!rows.length) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Demanda ${id} não encontrada.`,
          dados: null
        });
      }
      const atual = rows[0];

      // Whitelist de campos editáveis
      const permitidos = new Set([
        'emp_id',
        'amen_id',
        'demanda_quantidade',
        'demanda_preco_maximo',
        'demanda_data_entrega',
        'demanda_outras_informacoes',
        'demanda_data_publicacao',
        'demanda_ativa'
      ]);

      // Validações pontuais
      if (payload.demanda_quantidade !== undefined && !isNumPos(payload.demanda_quantidade)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_quantidade deve ser número >= 0.' });
      }
      if (payload.demanda_preco_maximo !== undefined && !isNumPos(payload.demanda_preco_maximo)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_preco_maximo deve ser número >= 0.' });
      }
      if (payload.demanda_data_entrega && !isDate(payload.demanda_data_entrega)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_data_entrega inválida.' });
      }
      if (payload.demanda_data_publicacao && !isDate(payload.demanda_data_publicacao)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_data_publicacao inválida.' });
      }
      if (payload.demanda_ativa !== undefined && ![0, 1, '0', '1', true, false].includes(payload.demanda_ativa)) {
        return response.status(422).json({ sucesso: false, mensagem: 'demanda_ativa deve ser 0/1 (ou booleano).' });
      }

      // Diff real (apenas o que mudou)
      const normaliza = (campo, val) => {
        if (val === null || val === undefined) return val;
        if (['demanda_quantidade', 'demanda_preco_maximo', 'emp_id', 'amen_id'].includes(campo)) return Number(val);
        if (campo === 'demanda_ativa') return Number(val);
        if (['demanda_data_entrega', 'demanda_data_publicacao'].includes(campo)) {
          try { return new Date(val).toISOString().slice(0, 10); } catch { return String(val); }
        }
        return String(val);
      };

      const sets = [];
      const values = [];
      const alteracoes = [];

      for (const [k, v] of Object.entries(payload)) {
        if (!permitidos.has(k) || v === undefined) continue;
        const novo = normaliza(k, v);
        const antigo = normaliza(k, atual[k]);
        if (novo !== antigo) {
          sets.push(`${k} = ?`);
          values.push(v);
          alteracoes.push({ campo: k, de: atual[k], para: v });
        }
      }

      if (!sets.length) {
        return response.status(200).json({
          sucesso: true,
          mensagem: `Nenhuma alteração aplicada na demanda ${id}.`,
          demanda_id: Number(id),
          alteracoes: []
        });
      }

      const sql = `UPDATE DEMANDAS SET ${sets.join(', ')} WHERE demanda_id = ?`;
      values.push(id);
      const [result] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Demanda ${id} atualizada com sucesso.`,
        demanda_id: Number(id),
        alteracoes,
        linhas_afetadas: result.affectedRows,
        campos_alterados: sets.length
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

        // Verificar existência antes de deletar
        const [rows] = await db.query('SELECT demanda_id FROM DEMANDAS WHERE demanda_id = ?', [id]);
        if (!rows.length) {
            return response.status(404).json({
                sucesso: false,
                mensagem: `Demanda ${id} não encontrada`,
            });
        }

        // ⚠️ SOLUÇÃO: Desabilita FKs temporariamente
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        const sql = `DELETE FROM DEMANDAS WHERE demanda_id = ?`;
        const values = [id];
        const [result] = await db.query(sql, values);

        // ⚠️ IMPORTANTE: Reabilita FKs
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        return response.status(200).json({
            sucesso: true,
            mensagem: `Demanda ${id} excluída com sucesso`,
            dados: null
        });
    } catch (error) {
        // ⚠️ GARANTIR que FKs são reabilitadas mesmo em caso de erro
        await db.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {}); // Ignora erro se já estiver habilitado
        
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
        demanda_id, emp_id, amen_id, min_quantidade, max_quantidade, min_preco, max_preco, de_entrega, ate_entrega, texto, ativa
      } = req.query;

      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (demanda_id && !isNaN(demanda_id)) {
        where.push('d.demanda_id = ?');
        values.push(Number(demanda_id));
      }
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

      const selectSql = `
        SELECT 
          d.demanda_id, d.emp_id, emp.emp_nome_fantasia, d.amen_id, am.amen_variedade, 
          d.demanda_quantidade, d.demanda_preco_maximo, d.demanda_data_entrega, 
          d.demanda_outras_informacoes, d.demanda_data_publicacao , d.demanda_imagem, d.demanda_ativa = 1 AS demanda_ativa 
        FROM DEMANDAS d 
        INNER JOIN empresas emp ON d.emp_id = emp.emp_id 
        INNER JOIN amendoins am ON d.amen_id = am.amen_id 
        ${whereSql} 
        ORDER BY d.demanda_id DESC 
        LIMIT ? OFFSET ?
      `;

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM DEMANDAS d ' +
        whereSql;

      const [rows] = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      // ✅ CORREÇÃO: Mesma lógica de normalização do listarDemandas
      const normalizarUrlImagem = (urlOuNome) => {
        if (!urlOuNome) return null;
        
        if (urlOuNome.includes('://')) {
          if (urlOuNome.includes('/public/demandas/')) {
            const nomeArquivo = urlOuNome.split('/').pop();
            return `http://localhost:3333/uploads/demandas/${nomeArquivo}`;
          }
          return urlOuNome;
        }
        
        return `http://localhost:3333/uploads/demandas/${urlOuNome}`;
      };

      const dados = rows.map(demanda => ({
        ...demanda,
        demanda_imagem: normalizarUrlImagem(demanda.demanda_imagem) || 
                       gerarUrl(demanda.demanda_imagem, 'demandas', 'padrao.png')
      }));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de demandas (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: dados.length,
        dados: dados
      });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar demandas', dados: error.message });
    }
  }
};