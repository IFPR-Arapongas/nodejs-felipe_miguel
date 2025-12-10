import express from 'express'
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import argon2 from 'argon2';
import cors from 'cors';

const app = express()

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static('Frontend'));

dotenv.config();

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    database: 'favorito_chuteira'
});

function autenticarToken(req, res, next) {
    const token = req.cookies['authToken'];
 
    if (!token) {
        return res.status(401).send({ auth: false, mensagem: 'Nenhum token informado' });
    }
 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id_usuario = decoded.id_usuario; 
        next();
    } catch (err) {
        return res.status(401).send({
            auth: false,
            mensagem: 'Token inválido ou expirado.'
        });
    }
}

app.use('/adicionar', autenticarToken); 

app.post("/adicionar", async (req, res) => {
    const id_usuario = req.id_usuario; 
    const { nome, marca_chuteira } = req.body;
    
    if (!nome || !marca_chuteira) {
        return res.status(400).send("Nome e marca da chuteira são obrigatórios.");
    }

    const inserirFavorito = `
        INSERT INTO favoritos (id_usuario, nome, marca_chuteira)
        VALUES (?, ?, ?)
    `;

    try {
        await db.query(inserirFavorito, [id_usuario, nome, marca_chuteira]); 
        res.status(201).send("Chuteira salva com sucesso!");
    } catch (err) {
        console.error("Erro ao salvar favorito:", err);
        return res.status(500).send("Erro ao salvar chuteira.");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT id, senha FROM usuarios WHERE email = '?'",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ auth: false, mensagem: 'Usuário ou senha inválidos' });
        }

        const user = rows[0];
        
        const isPasswordValid = await argon2.verify(user.senha, password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ auth: false, mensagem: 'Usuário ou senha inválidos' });
        }
        
        let token = jwt.sign(
             { email: email, id_usuario: user.id }, 
             process.env.JWT_SECRET,
             { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('authToken', token, {
             httpOnly: true, 
             maxAge: 24 * 3600000, 
             sameSite: 'Lax',
             secure: false
        });

        return res.status(200).json({ auth: true, mensagem: 'Login realizado com sucesso!' });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ auth: false, mensagem: 'Erro interno do servidor' });
    }
});

app.post('/cadastro', async (req, res) => {
    const { email, password } = req.body;
 
    if (!email || !password) {
        return res.status(400).send({ mensagem: 'Email e senha são obrigatórios.' });
    }
 
    try {
        const [existingUsers] = await db.query(
            "SELECT id FROM usuarios WHERE email = '?'", 
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).send({ mensagem: 'Email já cadastrado.' });
        }
 
        const hashedPassword = await argon2.hash(password);
 
        const inserirUsuario = "INSERT INTO usuarios (email, senha) VALUES ('?', '?')";
        const [result] = await db.query(inserirUsuario, [email, hashedPassword]);
        
        res.status(201).send({ 
            mensagem: 'Usuário registrado com sucesso!', 
            id: result.insertId 
        });
 
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send({ mensagem: 'Erro interno do servidor durante o cadastro.' });
    }
});

app.get("/", (req, res) => {
    res.sendFile('index.html', { root: 'Frontend' }); 
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});

export function verificarHeaderToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).send({
            auth: false,
            mensagem: "Nenhum token fornecido"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id_usuario = decoded.id_usuario;
        next();
    } catch (err) {
        return res.status(401).send({
            auth: false,
            mensagem: "Token inválido ou expirado"
        });
    }
}

