const db = require("../dataBase/connection");
const crypto = require('../utils/crypto');
const {gerarUrl} = require('../utils/gerarUrl');

module.exports = {
  async listarUsuarios(request, response) {
    try {
      const sql = `SELECT usu_id,usu_tipo_usuario,usu_nome,usu_documento,usu_email, 
                   usu_senha,usu_endereco,usu_telefone ,usu_data_cadastro 
                   FROM USUARIOS;`;

      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      const dados = rows.map (usuarios => ({
        ...usuarios,
        usu_imagem: gerarUrl (usuarios.usu_imagem, 'usuarios', 'padrao.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de usuários",
        nRegistros,
        dados
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async cadastrarUsuarios(request, response) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        usu_tipo_usuario,
        usu_nome,
        usu_documento,
        usu_email,
        usu_senha,
        usu_endereco,
        usu_telefone,
        usu_data_cadastro,
        agri_localizacao_propriedade,
        agri_tipos_amendoim_cultivados, 
        agri_certificacoes,
        emp_razao_social,
        emp_nome_fantasia,
        emp_tipo_atividade
      } = request.body;

      let imagemFinal = null;
      let urlImagem = null;

      if (request.file) {
        imagemFinal = request.file.filename;
        urlImagem = gerarUrl(imagemFinal, 'usuarios');
      } else {
        imagemFinal = 'padrao.png';
        urlImagem = gerarUrl('padrao.png', 'usuarios', 'padrao.png');
      }

      const senhaCriptografada = await crypto.hashPassword(usu_senha);

      let specificId;
      let specificTable;

      if (usu_tipo_usuario === '1') {
        const [agricultorResult] = await connection.execute(
          `INSERT INTO AGRICULTORES 
           (agri_nome, agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_telefone, agri_email) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            usu_nome, 
            agri_localizacao_propriedade || '', 
            agri_tipos_amendoim_cultivados || '', 
            agri_certificacoes || '',
            usu_telefone,
            usu_email
          ]
        );
        specificId = agricultorResult.insertId;
        specificTable = 'AGRICULTORES';
        
      } else {
        const [empresaResult] = await connection.execute(
          `INSERT INTO EMPRESAS 
           (emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, emp_telefone, emp_email) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            emp_razao_social || '',
            emp_nome_fantasia || '', 
            emp_tipo_atividade || '',
            usu_telefone,
            usu_email
          ]
        );
        specificId = empresaResult.insertId;
        specificTable = 'EMPRESAS';
      }

      const sqlUsuarios = `
        INSERT INTO USUARIOS 
        (usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, 
         usu_endereco, usu_telefone, usu_data_cadastro, usu_imagem,
         ${usu_tipo_usuario === '1' ? 'agri_id' : 'emp_id'}) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const valuesUsuarios = [
        usu_tipo_usuario,
        usu_nome,
        usu_documento,
        usu_email,
        senhaCriptografada,
        usu_endereco,
        usu_telefone,
        usu_data_cadastro,
        imagemFinal,
        specificId
      ];

      const [usuarioResult] = await connection.execute(sqlUsuarios, valuesUsuarios);
      await connection.commit();

      const dados = {
        id: usuarioResult.insertId,
        nome: usu_nome,
        email: usu_email,
        tipo: usu_tipo_usuario,
        imagem: urlImagem,
        specificId: specificId,
        specificTable: specificTable
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: "Cadastro realizado com sucesso!",
        dados: dados,
      });

    } catch (error) {
      await connection.rollback();
      console.error('❌ Erro no cadastro:', error);
      
      return response.status(500).json({
        sucesso: false,
        mensagem: error.sqlMessage || "Erro no cadastro.",
        dados: error.message,
      });
    } finally {
      connection.release();
    }
  },

async editarUsuarios(request, response) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log('🟢 EDITAR USUÁRIO CHAMADO');
    console.log('📝 Parâmetros:', request.params);
    console.log('📦 Body:', request.body);
    console.log('📁 File:', request.file);

    const { id } = request.params;
    const { 
      nome, 
      email, 
      senha, 
      telefone,
      cep,
      cidade,
      estado,
      endereco,
      outrasInformacoes
    } = request.body;
    
    // 1. Primeiro, buscar o usuário para saber o tipo e IDs relacionados
    const [usuarioAtual] = await connection.execute(
      `SELECT usu_tipo_usuario, agri_id, emp_id FROM USUARIOS WHERE usu_id = ?`,
      [id]
    );

    if (usuarioAtual.length === 0) {
      await connection.rollback();
      return response.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      });
    }

    const usuario = usuarioAtual[0];
    const isAgricultor = usuario.usu_tipo_usuario === '1';
    const specificId = isAgricultor ? usuario.agri_id : usuario.emp_id;

    console.log('👤 Tipo de usuário:', isAgricultor ? 'Agricultor' : 'Empresa');
    console.log('🔗 ID específico:', specificId);

    let senhaCriptografada = senha;
    if (senha) {
      senhaCriptografada = await crypto.hashPassword(senha);
    }

    let imagemFinal = null;

    if (request.file) {
      imagemFinal = request.file.filename;
      console.log('🖼️ Nova imagem salva:', imagemFinal);
    }

    // 2. Atualizar tabela USUARIOS
    let sqlUsuario, valuesUsuario;

    if (senha && imagemFinal) {
      sqlUsuario = `
        UPDATE USUARIOS 
        SET usu_nome = ?, usu_email = ?, usu_senha = ?, usu_telefone = ?,
            usu_cep = ?, usu_cidade = ?, usu_estado = ?, usu_endereco = ?, usu_imagem = ?
        WHERE usu_id = ?
      `;
      valuesUsuario = [nome, email, senhaCriptografada, telefone, 
                      cep, cidade, estado, endereco, imagemFinal, id];
    } else if (senha) {
      sqlUsuario = `
        UPDATE USUARIOS 
        SET usu_nome = ?, usu_email = ?, usu_senha = ?, usu_telefone = ?,
            usu_cep = ?, usu_cidade = ?, usu_estado = ?, usu_endereco = ?
        WHERE usu_id = ?
      `;
      valuesUsuario = [nome, email, senhaCriptografada, telefone, 
                      cep, cidade, estado, endereco, id];
    } else if (imagemFinal) {
      sqlUsuario = `
        UPDATE USUARIOS 
        SET usu_nome = ?, usu_email = ?, usu_telefone = ?,
            usu_cep = ?, usu_cidade = ?, usu_estado = ?, usu_endereco = ?, usu_imagem = ?
        WHERE usu_id = ?
      `;
      valuesUsuario = [nome, email, telefone, 
                      cep, cidade, estado, endereco, imagemFinal, id];
    } else {
      sqlUsuario = `
        UPDATE USUARIOS 
        SET usu_nome = ?, usu_email = ?, usu_telefone = ?,
            usu_cep = ?, usu_cidade = ?, usu_estado = ?, usu_endereco = ?
        WHERE usu_id = ?
      `;
      valuesUsuario = [nome, email, telefone, 
                      cep, cidade, estado, endereco, id];
    }

    console.log('🔧 SQL Usuário:', sqlUsuario);
    console.log('📋 Values Usuário:', valuesUsuario);

    const [resultUsuario] = await connection.execute(sqlUsuario, valuesUsuario);
    
    if (resultUsuario.affectedRows === 0) {
      await connection.rollback();
      return response.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado para atualização.",
      });
    }

    // 3. Atualizar tabela específica (AGRICULTORES ou EMPRESAS)
    if (specificId) {
      let sqlSpecific, valuesSpecific;

      if (isAgricultor) {
        // Atualizar AGRICULTORES
        sqlSpecific = `
          UPDATE AGRICULTORES 
          SET agri_nome = ?, agri_telefone = ?, agri_email = ?,
              agri_localizacao_propriedade = ?, agri_outras_informacoes = ?
          WHERE agri_id = ?
        `;
        valuesSpecific = [
          nome, 
          telefone, 
          email,
          endereco, // usando endereco como localizacao_propriedade
          outrasInformacoes,
          specificId
        ];
        console.log('🌱 Atualizando AGRICULTOR ID:', specificId);
      } else {
        // Atualizar EMPRESAS  
        sqlSpecific = `
          UPDATE EMPRESAS 
          SET emp_nome_fantasia = ?, emp_telefone = ?, emp_email = ?
          WHERE emp_id = ?
        `;
        valuesSpecific = [
          nome, // usando nome como nome_fantasia
          telefone,
          email,
          specificId
        ];
        console.log('🏢 Atualizando EMPRESA ID:', specificId);
      }

      console.log('🔧 SQL Específico:', sqlSpecific);
      console.log('📋 Values Específico:', valuesSpecific);

      const [resultSpecific] = await connection.execute(sqlSpecific, valuesSpecific);
      console.log('✅ Tabela específica atualizada. Linhas afetadas:', resultSpecific.affectedRows);
    }

    await connection.commit();

    const dados = {
      id,
      nome,
      email,
      telefone,
      cep,
      cidade,
      estado,
      endereco,
      imagem: imagemFinal ? gerarUrl(imagemFinal, 'usuarios') : null,
      tipo: usuario.usu_tipo_usuario,
      specificId: specificId
    };

    console.log('✅ Usuário e tabela específica atualizados com sucesso');

    return response.status(200).json({
      sucesso: true,
      mensagem: `Usuário ${id} atualizado com sucesso`,
      dados,
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erro ao atualizar usuário:', error);
    return response.status(500).json({
      sucesso: false,
      mensagem: "Erro na atualização do usuário.",
      dados: error.message,
    });
  } finally {
    connection.release();
  }
},

  async apagarUsuarios(request, response) {
    try {
      const { id } = request.params;

      const sql = `DELETE FROM usuarios WHERE usu_id = ?`;
      const values = [id];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: `Usuário ${id} não encontrado`,
          dados: null,
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Usuário ${id} excluído com sucesso`,
        dados: null,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async login(request, response) {
    try {
      const { senha, email, tipo } = request.body;

      const sql = `
        SELECT usu_id, usu_nome, usu_tipo_usuario, usu_senha
        FROM USUARIOS
        WHERE usu_email = ? AND usu_tipo_usuario = ?;
      `;

      const values = [email, tipo];
      const [rows] = await db.query(sql, values);

      if (rows.length < 1) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado ou senha incorreta.",
          dados: null,
        });
      }

      const usuario = rows[0];
      const senhaValida = await crypto.comparePassword(senha, usuario.usu_senha);
      
      if (!senhaValida) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado ou senha incorreta.",
          dados: null,
        });
      }

      const dados = {
        id: usuario.usu_id,
        nome: usuario.usu_nome,
        tipo: usuario.usu_tipo_usuario,
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        dados
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async listarUsuariosFiltro(req, res) {
    try {
      const { usu_nome, usu_email, usu_documento, usu_tipo_usuario } = req.query;

      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
      const offset = (page - 1) * limit;

      const where = [];
      const values = [];

      if (usu_nome && usu_nome.trim() !== '') {
        where.push('u.usu_nome LIKE ?');
        values.push(`%${usu_nome}%`);
      }
      if (usu_email && usu_email.trim() !== '') {
        where.push('u.usu_email LIKE ?');
        values.push(`%${usu_email}%`);
      }
      if (usu_documento && usu_documento.trim() !== '') {
        where.push('u.usu_documento LIKE ?');
        values.push(`%${usu_documento}%`);
      }
      if (usu_tipo_usuario !== undefined && String(usu_tipo_usuario).trim() !== '') {
        where.push('u.usu_tipo_usuario = ?');
        values.push(Number(usu_tipo_usuario));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const selectSql = `
        SELECT u.usu_id, u.usu_tipo_usuario, u.usu_nome, u.usu_documento, 
               u.usu_email, u.usu_endereco, u.usu_telefone, u.usu_data_cadastro 
        FROM USUARIOS u 
        ${whereSql} 
        ORDER BY u.usu_id DESC 
        LIMIT ? OFFSET ?
      `;

      const countSql = `SELECT COUNT(*) AS total FROM USUARIOS u ${whereSql}`;

      const [rows] = await db.query(selectSql, [...values, limit, offset]);
      const [countR] = await db.query(countSql, values);
      const total = countR[0]?.total || 0;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de usuários (filtros)',
        pagina: page,
        limite: limit,
        total,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return res.status(500).json({ 
        sucesso: false, 
        mensagem: 'Erro ao listar usuários', 
        dados: error.message 
      });
    }
  },

  async buscarUsuarioPorId(request, response) {
  try {
    const { id } = request.params;

    const sql = `
      SELECT u.*, 
             a.agri_localizacao_propriedade, a.agri_tipos_amendoim_cultivados,
             a.agri_certificacoes, a.agri_outras_informacoes,
             e.emp_razao_social, e.emp_nome_fantasia, e.emp_tipo_atividade
      FROM USUARIOS u
      LEFT JOIN AGRICULTORES a ON u.agri_id = a.agri_id
      LEFT JOIN EMPRESAS e ON u.emp_id = e.emp_id
      WHERE u.usu_id = ?
    `;

    const [rows] = await db.query(sql, [id]);
    
    if (rows.length === 0) {
      return response.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
        dados: null
      });
    }

    const usuario = rows[0];
    
    // Determinar qual nome usar baseado no tipo
    let nomeExibicao = usuario.usu_nome;
    if (usuario.usu_tipo_usuario === '1' && usuario.agri_localizacao_propriedade) {
      nomeExibicao = usuario.agri_localizacao_propriedade;
    } else if (usuario.usu_tipo_usuario === '2' && usuario.emp_nome_fantasia) {
      nomeExibicao = usuario.emp_nome_fantasia;
    }
    
    const dadosFormatados = {
      id: usuario.usu_id,
      tipo: usuario.usu_tipo_usuario,
      nome: usuario.usu_nome,
      nomeExibicao: nomeExibicao,
      email: usuario.usu_email,
      documento: usuario.usu_documento,
      telefone: usuario.usu_telefone,
      dataCadastro: usuario.usu_data_cadastro,
      imagem: usuario.usu_imagem,
      cep: usuario.usu_cep,
      cidade: usuario.usu_cidade,
      estado: usuario.usu_estado,
      endereco: usuario.usu_endereco,
      localizacaoPropriedade: usuario.agri_localizacao_propriedade,
      tiposAmendoim: usuario.agri_tipos_amendoim_cultivados,
      certificacoes: usuario.agri_certificacoes,
      outrasInformacoes: usuario.agri_outras_informacoes,
      razaoSocial: usuario.emp_razao_social,
      nomeFantasia: usuario.emp_nome_fantasia,
      tipoAtividade: usuario.emp_tipo_atividade
    };

    return response.status(200).json({
      sucesso: true,
      mensagem: "Usuário encontrado",
      dados: dadosFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return response.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar usuário",
      dados: error.message
    });
  }
}};