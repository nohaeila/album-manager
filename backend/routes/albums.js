const express = require("express");
const router = express.Router();
const db = require("../database"); // Connexion SQLite
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Crée le dossier s'il n'existe pas
}

// Configuration de l'upload avec multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Utilisation du chemin sécurisé
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 Mo
});

// Route pour l'upload d'un fichier dans un album existant
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }

  const { originalname, filename } = req.file;
  const filePath = `/uploads/${filename}`; // Chemin accessible via le serveur
  const { album_id } = req.body; // Récupérer l'ID de l'album

  if (!album_id) {
    return res.status(400).json({ message: "Album ID requis" });
  }

  // Log pour débogage
  console.log("filePath:", filePath);
  console.log("album_id:", album_id);

  // Insérer dans la base de données
  const sql = "UPDATE albums SET file_path = ? WHERE id = ?";
  db.run(sql, [filePath, album_id], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json({ message: "Fichier téléversé avec succès", filePath });
  });
});

// Route pour récupérer tous les albums
router.get("/", (req, res) => {
  db.all("SELECT * FROM albums", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la récupération des albums" });
    }

    // Log pour débogage
    console.log("Albums récupérés:", rows);

    // Si les albums contiennent des fichiers, renvoyer une liste de fichiers
    const mediaList = rows.map(row => ({
      id: row.id,
      title: row.name, // ou un autre attribut pour le titre
      description: row.description || 'Aucune description',
      filePath: `http://localhost:5000${row.file_path}`, // Assurez-vous que file_path est correct
      mimetype: row.mimetype // ou un attribut pour le type (image/vidéo)
    }));

    res.json(mediaList); // Utilise mediaList ici au lieu de rows
  });
});

