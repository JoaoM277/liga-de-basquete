const express = require('express');
const path = require('path'); // Corrigido: 'path' agora é definido no início
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'LigadeBasquete';
// Configuração do banco de dados SQLite
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'), (err) => {
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
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));
// Middleware para servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware para processar dados do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Rota de Inscrição
app.post('/inscrever', (req, res) => {
    const { nome_completo, idade, posicao, tempo_jogando, contato, turnos, dias } = req.body;

    const sql = `INSERT INTO inscricoes (nome_completo, idade, posicao, tempo_jogando, contato, turnos, dias, data_inscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        nome_completo,
        idade,
        posicao,
        tempo_jogando, // Corrigido: Agora está na ordem certa
        contato,
        JSON.stringify(turnos),
        JSON.stringify(dias),
        new Date().toISOString()
    ], function(err) {
        if (err) {
            console.error('Erro ao salvar inscrição no banco de dados:', err.message);
            // IMPORTANTE: Envie uma resposta de erro para o navegador para evitar o "carregando eterno"
            return res.status(500).send('Erro no servidor ao processar a inscrição.');
        }
        console.log(`Inscrição salva com sucesso, ID: ${this.lastID}`);
        
        // Redireciona para a página de pagamento
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
        res.sendFile(path.join(__dirname, '..', 'sucesso.html'));
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Rota de acesso ao painel de administração
app.get('/admin', (req, res) => {
    // Renderiza a página de login
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Rota para processar o login
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        // Se a senha estiver correta, busca todos os dados do banco
        db.all("SELECT * FROM inscricoes", (err, rows) => {
            if (err) {
                return res.status(500).send("Erro ao buscar dados do banco.");
            }
            // Envia os dados como resposta JSON
            res.json(rows);
        });
    } else {
        res.status(401).send("Senha incorreta.");
    }
});