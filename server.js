// Importações
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Senha para o painel de administração
const ADMIN_PASSWORD = 'sua_senha_secreta';

// Configuração do MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

// Esquema do Mongoose
const inscricaoSchema = new mongoose.Schema({
    nome_completo: String,
    idade: Number,
    posicao: String,
    tempo_jogando: String,
    contato: String,
    turnos: [String],
    dias: [String],
    data_inscricao: { type: Date, default: Date.now },
    comprovante_nome_arquivo: String
});
const Inscricao = mongoose.model('Inscricao', inscricaoSchema);

// Configuração do Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuração do Multer para o Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'liga-basquete-comprovantes',
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `comprovante-${Date.now()}`
    }
});
const upload = multer({ storage: storage });

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de Inscrição
app.post('/inscrever', async (req, res) => {
    const { nome_completo, idade, posicao, tempo_jogando, contato, turnos, dias } = req.body;
    
    // Converte os dados do formulário para o formato do MongoDB
    const novaInscricao = new Inscricao({
        nome_completo, idade, posicao, tempo_jogando, contato,
        turnos: JSON.parse(turnos),
        dias: JSON.parse(dias)
    });

    try {
        const inscricaoSalva = await novaInscricao.save();
        res.redirect(`/pagamento.html?inscricao_id=${inscricaoSalva._id}`);
    } catch (err) {
        console.error('Erro ao salvar inscrição:', err);
        res.status(500).send('Erro no servidor ao processar a inscrição.');
    }
});

// Rota de upload do comprovante
app.post('/upload', upload.single('comprovante'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const { inscricao_id } = req.query;
    const comprovanteUrl = req.file.path; // O Multer-Cloudinary nos dá o URL

    try {
        await Inscricao.findByIdAndUpdate(inscricao_id, { comprovante_nome_arquivo: comprovanteUrl });
        res.sendFile(path.join(__dirname, 'public', 'sucesso.html'));
    } catch (err) {
        console.error('Erro ao atualizar a inscrição:', err);
        res.status(500).send('Erro no servidor ao processar o comprovante.');
    }
});

// Rota de acesso ao painel de administração
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota para processar o login e enviar os dados
app.post('/admin/login', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});