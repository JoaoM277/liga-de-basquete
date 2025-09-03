const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Senha para o painel de administração
const ADMIN_PASSWORD = 'sua_senha_secreta';

// Configuração do banco de dados SQLite
const db = new sqlite3.Database(path.join(__dirname, 'server', 'db.sqlite'), (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS inscricoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_completo TEXT NOT NULL,
            idade INTEGER,
            posicao TEXT,
            tempo_jogando TEXT,
            contato TEXT,
            turnos TEXT,
            dias TEXT,
            data_inscricao TEXT,
            comprovante_nome_arquivo TEXT
        )`);
    }
});

// Configuração do Multer para o upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware para servir arquivos estáticos (HTML, CSS, JS e imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para processar dados do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de Inscrição
app.post('/inscrever', (req, res) => {
    const { nome_completo, idade, posicao, tempo_jogando, contato, turnos, dias } = req.body;

    const sql = `INSERT INTO inscricoes (nome_completo, idade, posicao, tempo_jogando, contato, turnos, dias, data_inscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        nome_completo,
        idade,
        posicao,
        tempo_jogando,
        contato,
        JSON.stringify(turnos),
        JSON.stringify(dias),
        new Date().toISOString()
    ], function(err) {
        if (err) {
            console.error('Erro ao salvar inscrição no banco de dados:', err.message);
            return res.status(500).send('Erro no servidor ao processar a inscrição.');
        }
        console.log(`Inscrição salva com sucesso, ID: ${this.lastID}`);

        res.redirect(`/pagamento.html?inscricao_id=${this.lastID}`);
    });
});

// Rota de upload do comprovante
app.post('/upload', upload.single('comprovante'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const { inscricao_id } = req.query;
    const comprovanteNomeArquivo = req.file.filename;

    const sql = `UPDATE inscricoes SET comprovante_nome_arquivo = ? WHERE id = ?`;
    db.run(sql, [comprovanteNomeArquivo, inscricao_id], function(err) {
        if (err) {
            console.error('Erro ao atualizar a inscrição com o comprovante:', err.message);
            return res.status(500).send('Erro no servidor ao processar o comprovante.');
        }
        console.log(`Comprovante salvo e vinculado à inscrição ID: ${inscricao_id}`);
        res.sendFile(path.join(__dirname, 'public', 'sucesso.html'));
    });
});

// Rota de acesso ao painel de administração
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota para processar o login e enviar os dados
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        db.all("SELECT * FROM inscricoes", (err, rows) => {
            if (err) {
                return res.status(500).send("Erro ao buscar dados do banco.");
            }
            res.json(rows);
        });
    } else {
        res.status(401).send("Senha incorreta.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});