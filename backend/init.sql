-- Création de la table "events" si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS events ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT
);

-- Création de la table "users" pour gérer les utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' -- pour les droits
);

-- Création de la table "albums" pour stocker les albums
CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT 'Inconnu',
    title TEXT,
    description TEXT DEFAULT '',
    file_path TEXT, 
    year INTEGER,
    event_id INTEGER,
    visibility TEXT DEFAULT 'private',
    FOREIGN KEY (event_id) REFERENCES events(id)
);

ALTER TABLE albums ALTER COLUMN artist SET DEFAULT 'Inconnu';

ALTER TABLE albums ADD COLUMN year INTEGER;

ALTER TABLE albums ADD COLUMN file_path TEXT;

ALTER TABLE albums ADD COLUMN filePath TEXT;

ALTER TABLE albums ADD COLUMN event_id INTEGER;

ALTER TABLE albums ADD COLUMN visibility INTEGER;


ALTER TABLE albums ALTER COLUMN description SET DEFAULT '';

-- Création de la table "permissions" pour gérer les droits des utilisateurs sur les albums
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'editor', 
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

