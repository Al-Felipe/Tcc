const express = require("express");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const server = express();
const port = 3000;
const conexaoBanco = require("./db");

server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  session({
    secret: "senha123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 3600000,
    },
  })
);

const checkUserLogado = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  } else {
    next();
  }
};

server.get("/", checkUserLogado, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.get("/api/user", checkUserLogado, (req, res) => {
  res.json({
    nome: req.session.user.nome,
    tipo: req.session.user.tipo,
  });
});

// ROTA CADASTRO
server.post("/cadastrar", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    // Verifica se o e-mail já existe
    const [rows] = await conexaoBanco.query(
      "SELECT id_usuario FROM Usuario WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res.redirect("/cadastro.html?error=email_existente");
    }

    // Verifica se já existe um dogwalker cadastrado
    const [dogwalkerExistente] = await conexaoBanco.query(
      "SELECT COUNT(*) AS total FROM Dogwalker"
    );

    let tipoFinal = tipo;

    // Se o usuário escolheu dogwalker mas já existe um, muda para usuario
    if (tipo === "dogwalker" && dogwalkerExistente[0].total > 0) {
      tipoFinal = "usuario";
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o usuário principal
    const [resultado] = await conexaoBanco.query(
      "INSERT INTO Usuario (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)",
      [nome, email, senhaHash, tipoFinal]
    );

    const idUsuario = resultado.insertId;

    // Se for cliente → cria na tabela Cliente
    if (tipoFinal === "usuario") {
      await conexaoBanco.query("INSERT INTO Cliente (id_usuario) VALUES (?)", [
        idUsuario,
      ]);
    }

    // Se for dogwalker (e ainda não existir outro) → cria na tabela Dogwalker
    if (tipoFinal === "dogwalker") {
      await conexaoBanco.query(
        "INSERT INTO Dogwalker (id_usuario) VALUES (?)",
        [idUsuario]
      );
    }

    return res.redirect("/login.html");
  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);
    res.status(500).send("Erro ao cadastrar usuário");
  }
});

// ROTA LOGIN
server.post("/login", async (req, res) => {
  const { login, senha } = req.body; // Pode ser nome ou email

  try {
    const [rows] = await conexaoBanco.query(
      "SELECT * FROM Usuario WHERE email = ? OR nome = ?",
      [login, login]
    );

    if (rows.length === 0) {
      return res.redirect("/login.html?error=not_found");
    }

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.redirect("/login.html?error=wrong_password");
    }

    // Cria sessão
    req.session.user = {
      id: usuario.id_usuario,
      nome: usuario.nome,
      tipo: usuario.tipo_usuario,
    };

    // Redireciona conforme o tipo
    if (usuario.tipo_usuario === "dogwalker") {
      return res.redirect("/dogwalker/dogwalkerinicio.html");
    } else {
      return res.redirect("/home.html");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).send("Erro no servidor durante o login.");
  }
});

server.get("/logout", (req, res) => {
  // ETAPA 6: DESTRUINDO A SESSÃO
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      return res.status(500).send("Não foi possível fazer logout.");
    }
    // Limpa o cookie do cliente e redireciona para a página de login.
    res.clearCookie("connect.sid"); // 'connect.sid' é o nome padrão do cookie de sessão do express-session
    res.redirect("/login.html");
  });
});

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
