const express = require('express');// Importation du framework Express
const multer = require('multer');//Multer pour gérer les fichiers uploadés
const cors = require('cors');// Permet les requêtes depuis d'autres domaines
const path = require('path');//Manipule les chemins des fichiers
const fs = require('fs');//Gère les fichiers et dossiers
const db = require('./database');//Connexion à la base de données
const usersRoutes = require('./user');// Importation des routes utilisateur
const authMiddleware = require('./authMiddleware');// Protége certaines routes

const app = express();
const PORT = process.env.PORT || 5000;// Port du serveur

// Vérifier si le dossier uploads existe, sinon le créer
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Dossier uploads créé');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.urlencoded({ extended: true }));// Permet de gérer les données envoyées via des formulaires
app.use('/uploads', express.static(uploadDir));// Sert les fichiers du dossier 'uploads' en statique

// Configuration de Multer pour gérer l'upload des fichiers
    const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/api/public', (req, res) => res.json({ message: 'Ceci est une route publique' }));
app.get('/api/protected-route', authMiddleware, (req, res) => res.json({ message: 'Accès autorisé', user: req.user }));
app.use('/api', usersRoutes);

// Téléversement d'un album
app.post("/upload", upload.single('file'), (req, res) => {
    const { name, title, artist, year, event_id, visibility } = req.body;
    const authorized_users = req.body.authorized_users || [];

    const filePath = req.file ? `/uploads/${req.file.filename}` : null;// Vérifie si un fichier a été uploadé

    db.run(
        `INSERT INTO albums (name, title, artist, year, file_path, event_id, visibility) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, title, artist, year, filePath, event_id, visibility],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            const albumId = this.lastID;
            // Ajout des permissions pour les utilisateurs autorisés
            const promises = authorized_users.map(userId => {
                return new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO permissions (album_id, user_id, role) VALUES (?, ?, ?)',
                        [albumId, userId, 'editor'],
                        err => err ? reject(err) : resolve()
                    );
                });
            });

            Promise.all(promises)
                .then(() => res.json({ message: "Album ajouté avec succès !" }))
                .catch(err => res.status(500).json({ error: err.message }));
        }
    );
});


// Route pour récupérer tous les albums
app.get('/albums', (req, res) => {
    db.all('SELECT * FROM albums ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des albums' });
        }
        res.json(rows);
    });
});

// Route pour supprimer un album
app.delete('/delete_album/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM albums WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true });
    });
});

// Route pour mettre à jour un album
app.put('/update_album/:id', (req, res) => {
    const id = req.params.id;
    const { name, title, artist, year } = req.body;
    
    db.run(
        'UPDATE albums SET name = ?, title = ?, artist = ?, year = ? WHERE id = ?',
        [name, title, artist, year, id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: "Album mis à jour avec succès" });
        }
    );
});


// Route pour créer un événement
app.post('/events', (req, res) => {
    const { name, date } = req.body;
    db.run('INSERT INTO events (name, date) VALUES (?, ?)', 
        [name, date], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, date });
        });
});

// Route pour récupérer les événements
app.get('/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur en ligne sur http://localhost:${PORT}`));
