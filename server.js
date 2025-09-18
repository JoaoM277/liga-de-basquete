const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sua_senha_secreta';

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

const inscricaoSchema = new mongoose.Schema({
    nome_completo: String,
    idade: Number,
    posicao: String,
    tempo_jogando: String,
    contato: String,
    sexo: String,
    turnos: [String],
    dias: [String],
    data_inscricao: { type: Date, default: Date.now },
    comprovante_nome_arquivo: String,
    senha_unica: String
});
const Inscricao = mongoose.model('Inscricao', inscricaoSchema, 'inscricoes');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'liga-basquete-comprovantes',
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `comprovante-${Date.now()}`
    }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/inscrever', async (req, res) => {
    await connectDb();
    const { nome_completo, idade, posicao, tempo_jogando, contato, sexo, turnos, dias } = req.body;
    
    const senha_unica = Math.random().toString(36).substring(2, 8);

    const novaInscricao = new Inscricao({
        nome_completo, idade, posicao, tempo_jogando, contato, sexo,
        turnos: turnos,
        dias: dias,
        senha_unica: senha_unica
    });

    try {
        const inscricaoSalva = await novaInscricao.save();
        res.redirect(`/pagamento.html?inscricao_id=${inscricaoSalva._id}&senha_unica=${inscricaoSalva.senha_unica}`);
    } catch (err) {
        console.error('Erro ao salvar inscrição:', err);
        res.status(500).send('Erro no servidor ao processar a inscrição.');
    }
});

app.post('/login-inscricao', async (req, res) => {
    await connectDb();
    const { nome_completo, senha_unica } = req.body;

    try {
        const inscricao = await Inscricao.findOne({ nome_completo, senha_unica });
        if (inscricao) {
            res.redirect(`/pagamento.html?inscricao_id=${inscricao._id}`); // Redireciona para a página de pagamento
        } else {
            res.status(401).send('Nome de usuário ou senha incorretos.');
        }
    } catch (err) {
        console.error('Erro ao buscar inscrição:', err);
        res.status(500).send('Erro no servidor ao buscar inscrição.');
    }
});

app.get('/api/inscricao/:id', async (req, res) => {
    await connectDb();
    try {
        const inscricao = await Inscricao.findById(req.params.id);
        if (inscricao) {
            res.status(200).json(inscricao);
        } else {
            res.status(404).send('Inscrição não encontrada.');
        }
    } catch (err) {
        console.error('Erro ao buscar inscrição:', err);
        res.status(500).send('Erro interno do servidor.');
    }
});

app.get('/api/status-pagamento/:id', async (req, res) => {
    await connectDb();
    try {
        const inscricao = await Inscricao.findById(req.params.id, 'comprovante_nome_arquivo');
        if (inscricao) {
            res.status(200).json({ comprovante_enviado: !!inscricao.comprovante_nome_arquivo });
        } else {
            res.status(404).send('Inscrição não encontrada.');
        }
    } catch (err) {
        console.error('Erro ao buscar status do pagamento:', err);
        res.status(500).send('Erro interno do servidor.');
    }
});

app.post('/salvar-edicao', async (req, res) => {
    await connectDb();
    const { inscricao_id, nome_completo, idade, posicao, tempo_jogando, contato, sexo, turnos, dias } = req.body;

    try {
        await Inscricao.findByIdAndUpdate(inscricao_id, {
            nome_completo, idade, posicao, tempo_jogando, contato, sexo, turnos, dias
        });
        res.redirect(`/pagamento.html?inscricao_id=${inscricao_id}`);
    } catch (err) {
        console.error('Erro ao atualizar inscrição:', err);
        res.status(500).send('Erro no servidor ao atualizar a inscrição.');
    }
});

app.post('/upload', upload.single('comprovante'), async (req, res) => {
    await connectDb();
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const { inscricao_id } = req.query;
    const comprovanteUrl = req.file.path;

    try {
        await Inscricao.findByIdAndUpdate(inscricao_id, { comprovante_nome_arquivo: comprovanteUrl });
        res.sendFile(path.join(__dirname, 'public', 'sucesso.html'));
    } catch (err) {
        console.error('Erro ao atualizar a inscrição:', err);
        res.status(500).send('Erro no servidor ao processar o comprovante.');
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/admin/login', async (req, res) => {
    await connectDb();
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        try {
            const inscricoes = await Inscricao.find({});
            res.json(inscricoes);
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            res.status(500).send('Erro ao buscar dados do banco.');
        }
    } else {
        res.status(401).send('Senha incorreta.');
    }
});

async function connectDb() {
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(MONGODB_URI, {
                connectTimeoutMS: 30000,
                socketTimeoutMS: 45000
            });
            console.log('Conectado ao MongoDB Atlas!');
        } catch (err) {
            console.error('Erro ao conectar ao MongoDB Atlas:', err);
            throw err;
        }
    }
}

module.exports = app;