import express from 'express';
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


// Rota POST protegida para adicionar um novo favorito
app.post('/adicionar', autenticarToken, async (req, res) => {
    // 1. O ID do usuário logado é extraído do token pelo middleware 'autenticarToken'
    const id_usuario = req.id_usuario; 
    
    // 2. Extrai os dados enviados pelo frontend
    // O frontend envia 'nome' (modelo da chuteira) e 'marca_chuteira'
    const { nome, marca_chuteira } = req.body; 

    // 3. Validação básica (opcional, mas recomendada)
    if (!nome || !marca_chuteira) {
        return res.status(400).send('Nome e marca são obrigatórios.');
    }

    try {
        // Query de inserção no banco de dados
        const query = `
            INSERT INTO favoritos (id_usuario, nome, marca_chuteira) 
            VALUES (?, ?, ?)
        `;
        
        // Executa a query
        await db.query(query, [id_usuario, nome, marca_chuteira]);

        // Resposta de sucesso
        res.status(201).send('Favorito adicionado com sucesso!');

    } catch (error) {
        console.error("Erro ao adicionar favorito no banco de dados:", error);
        // Retorna 500 se houver um problema no banco de dados
        res.status(500).send('Erro interno ao salvar favorito.');
    }
});

app.get('/favoritos', autenticarToken, async (req, res) => {
    // O ID do usuário logado é obtido do token pelo middleware 'autenticarToken'
    const id_usuario = req.id_usuario; 

    try {
        // Query para selecionar todos os favoritos vinculados ao id_usuario
        const query = `
            SELECT nome, marca_chuteira, id_favorito
            FROM favoritos
            WHERE id_usuario = ?
        `;
        
        const [favoritos] = await db.query(query, [id_usuario]);

        // Retorna a lista de favoritos
        res.status(200).json(favoritos);

    } catch (error) {
        console.error("Erro ao listar favoritos:", error);
        // Retorna 500 se houver um problema no banco de dados
        res.status(500).json({ mensagem: 'Erro interno ao buscar favoritos.' });
    }
});

app.post('/login', async (req, res) => {
    // 1. Extrai o email e a password do corpo da requisição
    const { email, password } = req.body;

    // 2. Validação básica de entrada
    if (!email || !password) {
        return res.status(400).json({ auth: false, mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        const [rows] = await db.execute(
            "SELECT id, senha FROM usuarios WHERE email = ?",
            [email]
        );

        // 4. Verifica se o usuário foi encontrado
        if (rows.length === 0) {
            // Usa mensagem genérica por segurança (não diz se é o email ou a senha que está errado)
            return res.status(401).json({ auth: false, mensagem: 'Usuário ou senha inválidos' });
        }

        const user = rows[0];
        
        // 5. Verifica a senha usando Argon2
        const isPasswordValid = await argon2.verify(user.senha, password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ auth: false, mensagem: 'Usuário ou senha inválidos' });
        }
       
        let token = jwt.sign(
            { email: email, id_usuario: user.id }, 
                process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.cookie('authToken', token, {
            httpOnly: true, 
            maxAge: 24 * 3600000,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production' 
        });

        // 8. Resposta de Sucesso
        return res.status(200).json({ auth: true, mensagem: 'Login realizado com sucesso!' });

    } catch (error) {
        console.error("Login error:", error);
        // 9. Resposta de Erro Interno
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
            "SELECT id FROM usuarios WHERE email = ?", 
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).send({ mensagem: 'Email já cadastrado.' });
        }
 
        const hashedPassword = await argon2.hash(password);

        const inserirUsuario = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
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

