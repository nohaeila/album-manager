const express = require('express');
const bcrypt = require('bcrypt');// Hachage des mots de passe
const jwt = require('jsonwebtoken');
const db = require('./database'); 

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;// Récupération des données envoyées dans le corps de la requête

  // Vérification que le nom d'utilisateur et le mot de passe sont fournis
  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Requête SQL pour insérer un nouvel utilisateur dans la base de données
  const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  db.run(sql, [username, hashedPassword, role || 'user'], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    // Envoi d'une réponse avec l'ID de l'utilisateur créé, son nom d'utilisateur et son rôle
    res.status(201).json({ id: this.lastID, username, role: role || 'user' });
  });
});

// Route de connexion
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'tonSecretKey', { expiresIn: '1h' });
    res.json({ message: 'Connexion réussie', token });
  });
});

module.exports = router;
