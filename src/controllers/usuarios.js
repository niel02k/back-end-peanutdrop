const db = require("../dataBase/connection");
const mensagem = require("./Mensagem");

module.exports = {
  async listarUsuarios(request, response) {
    try {
      const sql = `SELECT usu_id,usu_tipo_usuario,usu_nome,usu_documento,usu_email, usu_senha,usu_endereco,usu_telefone ,usu_data_cadastro FROM USUARIOS;`;

      const [rows] = await db.query(sql);
      const nRegistros = rows.length;

      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de usuários",
        nRegistros,
        dados: rows,
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
    try {
      const {
        usu_tipo_usuario,
        usu_nome,
        usu_documento,
        usu_email,
        usu_senha,
        usu_endereco,
        usu_telefone,
        usu_data_cadastro,
      } = request.body;

      const sql = `
                        INSERT INTO USUARIOS 
                        (usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, usu_endereco, usu_telefone, usu_data_cadastro) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;

      const values = [
        usu_tipo_usuario,
        usu_nome,
        usu_documento,
        usu_email,
        usu_senha,
        usu_endereco,
        usu_telefone,
        usu_data_cadastro,
      ];

      const [result] = await db.query(sql, values);

      const dados = {
        id: result.insertId,
        nome: usu_nome,
        email: usu_email,
        tipo: usu_tipo_usuario,
      };
      return response.status(200).json({
        sucesso: true,
        mensagem: "Cadastro de usuários",
        dados: dados,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },
  async editarUsuarios(request, response) {
    try {
      const { id } = request.params;
      const { nome, email, senha, endereco, telefone } = request.body;

      const sql = `
                UPDATE USUARIOS 
                SET 
                    usu_nome = ?, 
                    usu_email = ?, 
                    usu_senha = ?, 
                    usu_endereco = ?, 
                    usu_telefone = ?
                WHERE usu_id = ?
            `;

      const values = [nome, email, senha, endereco, telefone, id];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado para atualização.",
          dados: null,
        });
      }

      const dados = {
        id,
        nome,
        email,
        telefone,
        endereco,
        senha,
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
      const { senha, email, tipo } = request.query;

      const sql = `
                SELECT
                    usu_id, usu_nome, usu_tipo_usuario
                FROM
                    USUARIOS
                WHERE
                    usu_email = ? AND usu_senha = ? AND usu_tipo_usuario = ?;
            `;

        const values = [email, senha, tipo];

        const [rows] = await db.query(sql, values);
        const nItens = rows.length;

        if (nItens < 1) {
        return response.status(404).json({
            sucesso: false,
            mensagem : "Usuário não encontrado ou senha incorreta.",
            dados: null,
        });
        }

        const dados = rows.map(usuario => ({
            id: usuario.usu_id,
            nome: usuario.usu_nome,
            tipo: usuario.usu_tipo_usuario,
        })
        )

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
  

  async listarUsuariosFiltro (request, response) { 
    try {
    // 1) Lê filtros / paginação
    const { usu_nome, usu_email } = req.query;     // filtros (parâmetros)
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const offset = (page - 1) * limit;

    // 2) WHERE dinâmico (só entra se veio o parâmetro)
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

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // 3) SELECT paginado (com CAST de BIT e campos “tratados”)
    const sql = `
      SELECT
        u.usu_id   AS id,
        u.usu_nome AS nome,
        u.usu_email AS email,
        CAST(u.usu_ativo AS UNSIGNED) AS ativo
      FROM usuarios u
      ${whereSql}
      ORDER BY u.usu_id DESC
      LIMIT ? OFFSET ?
    `;

    // 4) COUNT total (mesmos filtros)
    const sqlCount = `
      SELECT COUNT(*) AS total
      FROM usuarios u
      ${whereSql}
    `;

    // Empilha paginação no final dos values (mesmos values servem pro COUNT)
    const [rows]   = await db.query(sql,      [...values, limit, offset]);
    const [countR] = await db.query(sqlCount, values);
    const total = countR[0]?.total || 0;

    // 5) Retorno padronizado
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Lista de usuários',
      pagina: page,
      limite: limit,
      total,           // total de itens que batem o filtro
      itens: rows.length,
      dados: rows
    });
  } catch (error) {
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar usuários', dados: error.message });
  }
}
};
