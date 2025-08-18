<<<<<<< HEAD
// Controllers atualizados conforme Apostilas 004 (Consultas) e 005 (Validações)
// Padrões aplicados: filtros por query, paginação, JOINs (quando indicado), tratamento de BIT, try/catch, status HTTP consistentes.
// Observação: ajuste nomes de tabelas/colunas conforme seu schema real.

const db = require('../dataBase/connection'); // usa mysql2/promise com pool
/** Helpers comuns **/
function buildPagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.max(parseInt(query.limit || '20', 10), 1);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function pickFilters(query, allowed) {
  const where = [];
  const values = [];
  for (const key of allowed) {
    if (query[key] !== undefined && query[key] !== '') {
      where.push(`${key} LIKE ?`);
      values.push(`%${query[key]}%`);
    }
  }
  return { where, values };
  
}

function sendOk(res, mensagem, dados) {
  const arr = Array.isArray(dados) ? dados : (dados ? [dados] : []);
  res.status(200).json({ sucesso: true, mensagem, dados: arr, itens: arr.length });
}

function sendCreated(res, mensagem, dados) {
  res.status(201).json({ sucesso: true, mensagem, dados, itens: Array.isArray(dados) ? dados.length : 1 });
}

function sendNotFound(res, mensagem='Registro não encontrado.') {
  res.status(404).json({ sucesso: false, mensagem, dados: null, itens: 0 });
}

function sendBadRequest(res, mensagem) {
  res.status(400).json({ sucesso: false, mensagem, dados: null, itens: 0 });
}

function sendError(res, error) {
  res.status(500).json({ sucesso: false, mensagem: 'Erro na requisição.', dados: error.message, itens: 0 });
}
const bcrypt = require('bcrypt'); // Apostila 005 - criptografia de senha
=======
const db = require("../dataBase/connection");
const mensagem = require("./mensagem");
>>>>>>> parent of 7cdc967 (a)

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
};
