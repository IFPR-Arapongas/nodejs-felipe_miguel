import express from 'express'
import mysql from 'mysql2/promise';

const app = express()

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306'
})

db.connect(err => {
    if (err) throw err;
    console.log("MySQL conectado!");
});

app.post("/adicionar", (req, res) => {
    const { nome_usuario, marca_chuteira } = req.body;

    const inserirUsuario = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
    db.query(inserirUsuario, [${ nome_usuario }@teste.com, "12345"], (err, result) => {
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
    console.log("Servidor rodando em http://localhost:3306");
});




