// Importation du module SQLite3 avec le mode verbose pour un meilleur débogage
const sqlite3 = require('sqlite3').verbose();

// Connexion à la base SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Création de la table users si elle n'existe pas déjà
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );
`;

// Création de la table albums si elle n'existe pas déjà
db.run(`CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER,
  file_path TEXT
)`, (err) => {
  if (err) {
      console.error('Erreur lors de la création de la table:', err.message);
  } else {
      console.log('Table albums créée ou mise à jour avec succès.');
  }
});

// Tentative d'ajout de la colonne file_path si elle n'existe pas
db.run("ALTER TABLE albums ADD COLUMN file_path TEXT", (err) => {
  if (err) {
      console.log("La colonne 'file_path' existe déjà ou une erreur est survenue.");
  } else {
      console.log("Colonne 'file_path' ajoutée avec succès.");
  }
});

// Ajouter la colonne event_id
db.run("ALTER TABLE albums ADD COLUMN event_id INTEGER REFERENCES events(id)", (err) => {
  if (err) {
      console.log("La colonne 'event_id' existe déjà ou une erreur est survenue.");
  } else {
      console.log("Colonne 'event_id' ajoutée avec succès.");
  }
});

// Ajouter la colonne visibility
db.run("ALTER TABLE albums ADD COLUMN visibility INTEGER", (err) => {
  if (err) {
      console.log("La colonne 'visibility' existe déjà ou une erreur est survenue.");
  } else {
      console.log("Colonne 'visibility' ajoutée avec succès.");
  }
});

module.exports = db;