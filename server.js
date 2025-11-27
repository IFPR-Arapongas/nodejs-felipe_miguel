import express from 'express'
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

dotenv.config();

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306'
})

app.post("/adicionar", (req, res) => {
    const { nome_usuario, marca_chuteira } = req.body;

    const inserirUsuario = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
    db.query(inserirUsuario, [`${ nome_usuario }@teste.com`, "12345"], (err, result) => {
        if (err) throw err;

        const idUsuario = result.insertId;

        const inserirFavorito = `INSERT INTO favoritos (id_usuario, nome_usuario, marca_chuteira)
            VALUES (?, ?, ?, ?)`;

        db.query(inserirFavorito, [idUsuario, nome_usuario, marca_chuteira, titulo_item], (err2) => {
            if (err2) throw err2;

            res.send("Chuteira salva com sucesso!");
        });
    });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});

function autenticarToken(req, res, next) {
    const token = req.cookies['authToken'];
  
    if (!token)
      return res.status(401).send({ auth: false, mensagem: 'Nenhum token informado' })
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.email = decoded.email;
      next();
    } catch (err) {
      return res.status(401).send({
        auth: false,
        mensagem: 'Token inválido ou expirado.'
      });
    }
  }
  
  app.post('/login', async (req, res) => {
    let { email, senha } = req.body;
  
    if (email != 'teste@gmail.com' || senha !== '123456') {
      return res.status(401).send({
        auth: false,
        mensagem: 'Usuário ou senha inválidos'
      })
    }
  
    let token = jwt.sign(
      { email: email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  
    res.cookie('authToken', token, {
      httpOnly: true, 
      maxAge: 24 * 3600000, 
      sameSite: 'Lax'
    });
    res.status(200).send({ auth: true, message: 'Login realizado com sucesso' })
})




