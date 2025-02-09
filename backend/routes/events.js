const express = require('express');
const router = express.Router();
const db = require('../database'); // Connexion SQLite

// Récupérer tous les événements
router.get('/', (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la récupération des événements" });
    }
    res.json(rows); // Envoie la liste des événements
  });
});

// Ajouter un événement (optionnellement avec un album associé)
router.post('/', (req, res) => {
  const { name, date } = req.body; // Par exemple, un événement avec un nom et une date

  if (!name || !date) {
    return res.status(400).json({ message: "Nom et date de l'événement sont requis" });
  }

  const sql = 'INSERT INTO events (name, date) VALUES (?, ?)';
  db.run(sql, [name, date], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ id: this.lastID, name, date });
  });
});

module.exports = router;
