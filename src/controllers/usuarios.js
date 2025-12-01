const db = require("../dataBase/connection");
const crypto = require('../utils/crypto');
const {gerarUrl} = require('../utils/gerarUrl');
const nodemailer = require('nodemailer');

// ==================================================
// FUNÇÕES AUXILIARES (FORA DO module.exports)
// ==================================================

// Função para enviar email de recuperação
async function enviarEmailRecuperacao(emailDestino, nomeUsuario, codigo) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    
    const mailOptions = {
      from: `PeanutDrop Sistema <${process.env.MAIL_USER}>`,
      to: emailDestino,
      subject: 'Código de Recuperação de Senha - PeanutDrop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2E7D32, #4CAF50); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">PeanutDrop</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #2E7D32;">Recuperação de Senha</h2>
            <p>Olá <strong>${nomeUsuario}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para continuar:</p>
            <div style="background-color: #2E7D32; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${codigo}
            </div>
            <p>Este código expira em <strong>15 minutos</strong>.</p>
            <p>Se você não solicitou esta recuperação, ignore este email.</p>
          </div>
          <div style="background-color: #e8f5e8; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>PeanutDrop - Plataforma de Conectividade Agrícola</p>
            <p>Email automático, por favor não responda.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperação enviado para: ${emailDestino}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}


module.exports = {
  async listarUsuarios(request, response) {
    try {
      const sql = `SELECT usu_id, usu_tipo_usuario, usu_nome, usu_documento, usu_email, 
                   usu_senha, usu_endereco, usu_telefone, usu_data_cadastro, usu_imagem 
                   FROM USUARIOS;`;

      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      const dados = rows.map(usuario => ({
        ...usuario,
        usu_imagem: gerarUrl(usuario.usu_imagem, 'usuarios', 'padrao.png')
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
      usu_tipo_usuario,  // AGORA: 1=Admin, 2=Agricultor, 3=Empresa
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
      imagemFinal = null;
      urlImagem = gerarUrl(null, 'usuarios', 'padrao.png');
    }

    const senhaCriptografada = await crypto.hashPassword(usu_senha);

    let specificId = null;
    let colunaExtra = '';
    let valorExtra = null;

    // 🔴 CORREÇÃO DEFINITIVA - CONSISTENTE COM SUAS OUTRAS FUNÇÕES
    if (usu_tipo_usuario === '2') {  // AGRICULTOR (como você já tem)
      const [agricultorResult] = await connection.execute(
        `INSERT INTO AGRICULTORES 
         (agri_nome, agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, 
          agri_certificacoes, agri_telefone, agri_email) 
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
      colunaExtra = 'agri_id';
      valorExtra = specificId;
    } 
    else if (usu_tipo_usuario === '3') {  // EMPRESA
      const [empresaResult] = await connection.execute(
        `INSERT INTO EMPRESAS 
         (emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, 
          emp_telefone, emp_email) 
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
      colunaExtra = 'emp_id';
      valorExtra = specificId;
    }
    // Tipo '1' (Admin) não cria registro em tabela específica

    // 🔴 CORREÇÃO CRÍTICA NO SQL
    const sqlUsuarios = `
      INSERT INTO USUARIOS 
      (usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, 
       usu_endereco, usu_telefone, usu_data_cadastro, usu_imagem
       ${colunaExtra ? ', ' + colunaExtra : ''}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?
              ${valorExtra ? ', ?' : ''})
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
      imagemFinal
    ];

    // Adicionar o valor extra se existir
    if (valorExtra) {
      valuesUsuarios.push(valorExtra);
    }

    const [usuarioResult] = await connection.execute(sqlUsuarios, valuesUsuarios);
    await connection.commit();

    // 🔴 CORREÇÃO NO RETORNO
    const dados = {
      id: usuarioResult.insertId,
      nome: usu_nome,
      email: usu_email,
      tipo: usu_tipo_usuario,
      agri_id: usu_tipo_usuario === '2' ? specificId : null,
      emp_id: usu_tipo_usuario === '3' ? specificId : null,
      imagem: urlImagem
    };

    return response.status(200).json({
      sucesso: true,
      mensagem: "Cadastro realizado com sucesso!",
      dados,
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erro no cadastro:', error);
    
    return response.status(500).json({
      sucesso: false,
      mensagem: error.sqlMessage || "Erro no cadastro.",
      dados: error.message,
    });
  } 
  finally {
    connection.release();
  }
},

  async editarUsuarios(request, response) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      console.log('🟢 EDITAR USUÁRIO CHAMADO (COM UPLOAD)');
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
      
      // 1. Buscar o usuário atual
      const [usuarioAtual] = await connection.execute(
        `SELECT usu_tipo_usuario, agri_id, emp_id, usu_imagem FROM USUARIOS WHERE usu_id = ?`,
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
      const isAgricultor = usuario.usu_tipo_usuario === '2';
      const specificId = isAgricultor ? usuario.agri_id : usuario.emp_id;

      console.log('👤 Tipo de usuário:', isAgricultor ? 'Agricultor' : 'Empresa');
      console.log('🔗 ID específico:', specificId);

      let senhaCriptografada = null;
      if (senha && senha.trim() !== '') {
        senhaCriptografada = await crypto.hashPassword(senha);
      }

      // CORREÇÃO: Lidar com o upload de imagem
      let imagemFinal = usuario.usu_imagem;
      
      if (request.file) {
        imagemFinal = request.file.filename;
        console.log('🖼️ Nova imagem salva:', imagemFinal);
      }

      // 2. Montar query dinâmica para USUARIOS
      const updates = [];
      const values = [];

      if (nome) { updates.push('usu_nome = ?'); values.push(nome); }
      if (email) { updates.push('usu_email = ?'); values.push(email); }
      if (senhaCriptografada) { updates.push('usu_senha = ?'); values.push(senhaCriptografada); }
      if (telefone) { updates.push('usu_telefone = ?'); values.push(telefone); }
      if (cep) { updates.push('usu_cep = ?'); values.push(cep); }
      if (cidade) { updates.push('usu_cidade = ?'); values.push(cidade); }
      if (estado) { updates.push('usu_estado = ?'); values.push(estado); }
      if (endereco) { updates.push('usu_endereco = ?'); values.push(endereco); }
      if (imagemFinal) { updates.push('usu_imagem = ?'); values.push(imagemFinal); }

      values.push(id);

      if (updates.length > 0) {
        const sqlUsuario = `UPDATE USUARIOS SET ${updates.join(', ')} WHERE usu_id = ?`;
        console.log('🔧 SQL Usuário:', sqlUsuario);
        console.log('📋 Values Usuário:', values);

        const [resultUsuario] = await connection.execute(sqlUsuario, values);
        
        if (resultUsuario.affectedRows === 0) {
          await connection.rollback();
          return response.status(404).json({
            sucesso: false,
            mensagem: "Usuário não encontrado para atualização.",
          });
        }
      }

      // 3. Atualizar tabela específica
      if (specificId) {
        if (isAgricultor) {
          const agricultorUpdates = [];
          const agricultorValues = [];

          if (nome) { agricultorUpdates.push('agri_nome = ?'); agricultorValues.push(nome); }
          if (telefone) { agricultorUpdates.push('agri_telefone = ?'); agricultorValues.push(telefone); }
          if (email) { agricultorUpdates.push('agri_email = ?'); agricultorValues.push(email); }
          if (endereco) { agricultorUpdates.push('agri_localizacao_propriedade = ?'); agricultorValues.push(endereco); }
          if (outrasInformacoes) { agricultorUpdates.push('agri_outras_informacoes = ?'); agricultorValues.push(outrasInformacoes); }

          agricultorValues.push(specificId);

          if (agricultorUpdates.length > 0) {
            const sqlAgricultor = `UPDATE AGRICULTORES SET ${agricultorUpdates.join(', ')} WHERE agri_id = ?`;
            await connection.execute(sqlAgricultor, agricultorValues);
          }
        } else {
          const empresaUpdates = [];
          const empresaValues = [];

          if (nome) { empresaUpdates.push('emp_nome_fantasia = ?'); empresaValues.push(nome); }
          if (telefone) { empresaUpdates.push('emp_telefone = ?'); empresaValues.push(telefone); }
          if (email) { empresaUpdates.push('emp_email = ?'); empresaValues.push(email); }

          empresaValues.push(specificId);

          if (empresaUpdates.length > 0) {
            const sqlEmpresa = `UPDATE EMPRESAS SET ${empresaUpdates.join(', ')} WHERE emp_id = ?`;
            await connection.execute(sqlEmpresa, empresaValues);
          }
        }
      }

      await connection.commit();

      // CORREÇÃO: Retornar apenas o nome do arquivo, não a URL completa
      const dados = {
        id,
        nome,
        email,
        telefone,
        cep,
        cidade,
        estado,
        endereco,
        imagem: imagemFinal, // ← CORREÇÃO: Retornar apenas o nome do arquivo
        tipo: usuario.usu_tipo_usuario,
        specificId: specificId
      };

      console.log('✅ Usuário atualizado com sucesso');
      console.log('📸 Imagem retornada:', imagemFinal);

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
        SELECT usu_id, usu_nome, usu_tipo_usuario, usu_senha, agri_id, emp_id
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
        agri_id: usuario.agri_id,
        emp_id: usuario.emp_id
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
      
      let nomeExibicao = usuario.usu_nome;
      if (usuario.usu_tipo_usuario === '2' && usuario.agri_localizacao_propriedade) {
        nomeExibicao = usuario.agri_localizacao_propriedade;
      } else if (usuario.usu_tipo_usuario === '3' && usuario.emp_nome_fantasia) {
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
        agri_id: usuario.agri_id, // ← ADICIONADO
        emp_id: usuario.emp_id,   // ← ADICIONADO
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

  // ==================================================
  // FUNÇÕES DE RECUPERAÇÃO DE SENHA
  // ==================================================

  async solicitarRecuperacaoSenha(req, res) {
    console.log('📨 REQUISIÇÃO RECEBIDA - Email:', req.body.email);
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { email } = req.body;

      console.log('🔍 Buscando usuário com email:', email);

      if (!email) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email é obrigatório'
        });
      }

      // Verificar se o usuário existe (PUXA DO BANCO)
      const [usuarios] = await connection.execute(
        'SELECT usu_id, usu_nome, usu_email FROM USUARIOS WHERE usu_email = ?',
        [email]
      );

      console.log('👤 Resultado da busca:', usuarios);

      if (usuarios.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      const usuario = usuarios[0];
      const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString();
      const expiracao = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      console.log('🔑 Código gerado:', codigoVerificacao);
      console.log('⏰ Expira em:', expiracao);

      // Invalidar códigos anteriores
      await connection.execute(
        'UPDATE recuperacao_senha SET used = 1 WHERE usuario_id = ? AND used = 0',
        [usuario.usu_id]
      );

      // Salvar novo código no banco
      console.log('💾 Salvando código no banco...');
      await connection.execute(
        'INSERT INTO recuperacao_senha (usuario_id, codigo, expiracao) VALUES (?, ?, ?)',
        [usuario.usu_id, codigoVerificacao, expiracao]
      );

      console.log('📧 Preparando para enviar email...');
      
      // 🔧 CORREÇÃO: Chama a função diretamente (sem "this")
      const emailEnviado = await enviarEmailRecuperacao(
        usuario.usu_email,
        usuario.usu_nome,
        codigoVerificacao
      );

      if (!emailEnviado) {
        console.log('❌ Falha no envio do email');
        await connection.rollback();
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao enviar email de recuperação'
        });
      }

      await connection.commit();
      console.log('✅ Processo concluído com sucesso!');

      res.json({
        sucesso: true,
        mensagem: 'Código de verificação enviado para seu email'
      });

    } catch (error) {
      await connection.rollback();
      console.log('💥 ERRO 500 - Detalhes completos:');
      console.log('📌 Mensagem:', error.message);
      console.log('🔍 Stack:', error.stack);
      
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor: ' + error.message
      });
    } finally {
      connection.release();
    }
  },

  async verificarCodigo(req, res) {
    try {
      const { email, codigo } = req.body;

      if (!email || !codigo) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email e código são obrigatórios'
        });
      }

      // Buscar código válido
      const [codigos] = await db.execute(
        `SELECT r.*, u.usu_id 
         FROM recuperacao_senha r 
         INNER JOIN USUARIOS u ON r.usuario_id = u.usu_id 
         WHERE u.usu_email = ? AND r.codigo = ? AND r.expiracao > NOW() AND r.used = 0`,
        [email, codigo]
      );

      if (codigos.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Código inválido ou expirado'
        });
      }

      res.json({
        sucesso: true,
        mensagem: 'Código válido'
      });

    } catch (error) {
      console.error('❌ Erro ao verificar código:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    }
  },

  async redefinirSenha(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { email, codigo, novaSenha } = req.body;

      if (!email || !codigo || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Todos os campos são obrigatórios'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar código válido
      const [codigos] = await connection.execute(
        `SELECT r.*, u.usu_id 
         FROM recuperacao_senha r 
         INNER JOIN USUARIOS u ON r.usuario_id = u.usu_id 
         WHERE u.usu_email = ? AND r.codigo = ? AND r.expiracao > NOW() AND r.used = 0`,
        [email, codigo]
      );

      if (codigos.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Código inválido ou expirado'
        });
      }

      const recuperacao = codigos[0];
      
      // Hash da nova senha
      const senhaCriptografada = await crypto.hashPassword(novaSenha);

      // Atualizar senha do usuário
      await connection.execute(
        'UPDATE USUARIOS SET usu_senha = ? WHERE usu_id = ?',
        [senhaCriptografada, recuperacao.usuario_id]
      );

      // Marcar código como usado
      await connection.execute(
        'UPDATE recuperacao_senha SET used = 1 WHERE id = ?',
        [recuperacao.id]
      );

      await connection.commit();

      res.json({
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      await connection.rollback();
      console.error('❌ Erro ao redefinir senha:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    } finally {
      connection.release();
    }
  }
};