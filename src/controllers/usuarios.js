const db = require("../dataBase/connection");
const mensagem = require("./Mensagem");
const crypto = require('../utils/crypto');
const {gerarUrl} = require('../../src/utils/gerarUrl');

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
      // Campos específicos do agricultor
      agri_localizacao_propriedade,
      agri_tipos_amendoim_cultivados, 
      agri_certificacoes,
      // Campos específicos da empresa
      emp_razao_social,
      emp_nome_fantasia,
      emp_tipo_atividade,
      imagem
    } = request.body;

    let imagemFinal = null;
    let urlImagem = null;

    if (request.file) {
      imagemFinal = request.file.filename;
      urlImagem = gerarUrl(imagemFinal, 'usuarios');
    } else if (imagem) {
      imagemFinal = imagem;
      urlImagem = imagem;
    } else {
      imagemFinal = 'padrao.png';
      urlImagem = gerarUrl('padrao.png', 'usuarios', 'padrao.png');
    }

    const senhaCriptografada = await crypto.hashPassword(usu_senha);

    // 1. PRIMEIRO: Inserir na tabela específica (AGRICULTORES ou EMPRESAS)
    let specificId;
    let specificTable;

    if (usu_tipo_usuario === '1') { // AGRICULTOR
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
      
    } else { // EMPRESA (tipo '2')
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

    // 2. SEGUNDO: Inserir na tabela USUARIOS com a referência
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
      specificId  // ID da tabela específica
    ];

    const [usuarioResult] = await connection.execute(sqlUsuarios, valuesUsuarios);

    await connection.commit();

    console.log(`✅ Cadastro realizado com sucesso!`);
    console.log(`   Usuário ID: ${usuarioResult.insertId}`);
    console.log(`   ${specificTable} ID: ${specificId}`);

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
    try {
      const { id } = request.params;
      const { nome, email, senha, endereco, telefone } = request.body;
      let senhaCriptografada = senha;
      if (senha) {
        senhaCriptografada = await crypto.hashPassword(senha);
      }
      let sql, values;
      if (usu_imagem) {
        sql = `
          UPDATE USUARIOS 
          SET usu_nome = ?, usu_email = ?, usu_senha = ?, usu_endereco = ?, usu_telefone = ?, usu_imagem = ?
          WHERE usu_id = ?
        `;
        values = [nome, email, senhaCriptografada, endereco, telefone, usu_imagem, id];
      } else {
        sql = `
          UPDATE USUARIOS 
          SET usu_nome = ?, usu_email = ?, usu_senha = ?, usu_endereco = ?, usu_telefone = ?
          WHERE usu_id = ?
        `;
        values = [nome, email, senhaCriptografada, endereco, telefone, id];
      }
      const [result] = await db.query(sql, values);
      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado para atualização.",
          dados: null,
        });
      }
      const { gerarUrl } = require('../utils/gerarUrl');
      const imagemUrl = usu_imagem ? gerarUrl(usu_imagem, 'usuarios', 'padrao.jpg') : null;
      const dados = {
        id,
        nome,
        email,
        telefone,
        endereco,
        imagem: imagemUrl
      };
      return response.status(200).json({
        sucesso: true,
        mensagem: `Usuário ${id} atualizado com sucesso`,
        dados,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
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
          mensagem: `Usario ${id} não encontrado `,
          dados: null,
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Usario ${id} excluido com sucesso `,
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
                SELECT
                    usu_id, usu_nome, usu_tipo_usuario, usu_senha
                FROM
                    USUARIOS
                WHERE
                    usu_email = ? AND usu_tipo_usuario = ?;
            `;

        const values = [email, tipo];
        const [rows] = await db.query(sql, values);
        const nItens = rows.length;

        if (nItens < 1) {
        return response.status(404).json({
            sucesso: false,
            mensagem : "Usuário não encontrado ou senha incorreta.",
            dados: null,
        });
        }

        const usuario = rows[0];
        const senhaValida = await crypto.comparePassword(senha, usuario.usu_senha);
        if (!senhaValida) {
          return response.status(404).json({
            sucesso: false,
            mensagem : "Usuário não encontrado ou senha incorreta.",
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
      const {
        usu_nome,          // LIKE
        usu_email,         // LIKE
        usu_documento,     // LIKE
        usu_tipo_usuario   // =
      } = req.query;

      const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
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

      const selectSql =
        'SELECT ' +
        '  u.usu_id, ' +
        '  u.usu_tipo_usuario, ' +
        '  u.usu_nome, ' +
        '  u.usu_documento, ' +
        '  u.usu_email, ' +
        '  u.usu_endereco, ' +
        '  u.usu_telefone, ' +
        '  u.usu_data_cadastro ' +
        'FROM USUARIOS u ' +
        whereSql +
        ' ORDER BY u.usu_id DESC ' +
        'LIMIT ? OFFSET ?';

      const countSql =
        'SELECT COUNT(*) AS total ' +
        'FROM USUARIOS u ' +
        whereSql;

      const [rows]   = await db.query(selectSql, [...values, limit, offset]);
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
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar usuários', dados: error.message });
    }
  },

  async buscarUsuarioPorId(request, response) {
  try {
    const { id } = request.params;

    const sql = `
      SELECT 
        u.*,
        a.agri_localizacao_propriedade,
        a.agri_tipos_amendoim_cultivados,
        a.agri_certificacoes,
        a.agri_outras_informacoes,
        e.emp_razao_social,
        e.emp_nome_fantasia,
        e.emp_tipo_atividade
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
    
    const dadosFormatados = {
      id: usuario.usu_id,
      tipo: usuario.usu_tipo_usuario,
      nome: usuario.usu_nome,
      email: usuario.usu_email,
      documento: usuario.usu_documento,
      endereco: usuario.usu_endereco,
      telefone: usuario.usu_telefone,
      dataCadastro: usuario.usu_data_cadastro,
      imagem: usuario.usu_imagem, // ou gerarUrl se tiver essa função
      // Dados específicos
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
}
};


