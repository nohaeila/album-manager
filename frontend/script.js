const apiUrl = 'http://localhost:5000/albums';

// Fonction pour obtenir le token d'authentification
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Si le token n'existe pas, rediriger vers la page de login
if (!getAuthToken()) {
    window.location.href = 'login.html';
} else {
 // Fonction pour récupérer les albums depuis l'API
     async function getMedia() {
        try {
            // Appel API avec le token d'authentification
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
            const data = await response.json();
            console.log("Réponse API :", data);
            if (!response.ok) throw new Error('Erreur de récupération');

            // Récupère l'élément de la liste des albums
            const albumsList = document.getElementById('albums-list');
            if (albumsList) {
                albumsList.innerHTML = ''; 
                if (data.length === 0) {
                    albumsList.innerHTML = '<p>Aucun album disponible.</p>';
                } else {
                    // Affiche chaque album dans la liste
                    data.forEach(album => {
                        const li = document.createElement('li');
                        li.textContent = `${album.title} - ${album.name}`;

                        // Vérifie si l'album contient une image ou une vidéo
                        const mediaContainer = document.createElement('div');
                        if (album.file_path) {
                            const fileExtension = album.file_path.split('.').pop().toLowerCase();

                            // Si c'est une image, l'ajoute à l'élément
                            if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
                                const img = document.createElement('img');
                                img.src = album.file_path;
                                img.alt = album.name;
                                img.style.maxWidth = '200px'; // Limite la taille de l'image
                                mediaContainer.appendChild(img);

                            // Si c'est une vidéo, l'ajoute à l'élément
                            } else if (['mp4', 'webm'].includes(fileExtension)) {
                                const video = document.createElement('video');
                                video.src = album.file_path;
                                video.controls = true;
                                mediaContainer.appendChild(video);
                            }
                        }

                        li.appendChild(mediaContainer);
                        albumsList.appendChild(li);
                    });
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
            const albumsList = document.getElementById('albums-list');
            if (albumsList) {
                albumsList.innerHTML = '<p>Erreur lors de la récupération des albums.</p>';
            }
        }
    }

    document.addEventListener('DOMContentLoaded', getMedia);

    // Gère le bouton pour ajouter un album
    const addAlbumBtn = document.getElementById('add-album-btn');
    if (addAlbumBtn) {
        addAlbumBtn.addEventListener('click', () => {
            const albumForm = document.getElementById('album-form');
            if (albumForm) {
                albumForm.style.display = albumForm.style.display === 'none' ? 'block' : 'none'; // Toggle du formulaire
            }
        });
    }

// Pour la prévisualisation de l'image
const fileInput = document.getElementById('file');
if (fileInput) {
    fileInput.addEventListener('change', function() {
        const previewImage = document.getElementById('preview-image');
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
}

// Pour le formulaire d'upload d'album
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const statusDiv = document.getElementById('upload-status');
        statusDiv.textContent = 'Upload en cours...';

        const formData = new FormData(this); // Crée un FormData avec les données du formulaire
        
        try {
            // Envoie les données du formulaire via POST à l'API
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                statusDiv.textContent = 'Album ajouté avec succès !';
                setTimeout(() => {
                    window.location.href = 'myAlbums.html';
                }, 1000);
            } else {
                statusDiv.textContent = 'Erreur : ' + result.error;
            }
        } catch (error) {
            console.error('Erreur:', error);
            statusDiv.textContent = 'Erreur lors de l\'upload : ' + error.message;
        }
    });
}

// Fonction pour récupérer les albums et les afficher
    async function getAlbums() {
        try {
            // Envoie une requête GET à l'API avec le token d'authentification
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });

            if (!response.ok) throw new Error('Erreur de récupération');
            
            const data = await response.json();
            console.log("Réponse API :", data);
            
            // Récupère l'élément de la liste des albums
            const albumsList = document.getElementById('albums-list');
            if (albumsList) {
                albumsList.innerHTML = '';

                if (data.length === 0) {
                    albumsList.innerHTML = '<p>Aucun album disponible.</p>';
                    return;
                }
                // Affiche chaque album dans la liste
                data.forEach(album => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${album.name}</strong> - ${album.artist} (${album.year}) 
                        <br>
                        <img src="${album.file_path}" alt="${album.name}" style="max-width: 200px;">
                        <br>
                        <button onclick="editAlbum(${album.id}, '${album.name}', '${album.artist}', '${album.year}')">Modifier</button>
                        <button onclick="deleteAlbum(${album.id})">Supprimer</button>
                    `;
                    albumsList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
            const albumsList = document.getElementById('albums-list');
            if (albumsList) {
                albumsList.innerHTML = '<p>Erreur lors de la récupération des albums.</p>';
            }
        }
    }

    document.addEventListener('DOMContentLoaded', getAlbums);

// Fonction pour charger et afficher les albums lors de l'affichage de la page myAlbums.html
async function loadAlbums() {
    try {
        const response = await fetch('http://localhost:5000/albums');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des albums');
        }
        const albums = await response.json();
        displayAlbums(albums);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('albums-container').innerHTML = 
            '<p>Erreur lors du chargement des albums</p>';
    }
}

// Fonction pour afficher les albums sous forme de cartes
function displayAlbums(albums) {
    const container = document.getElementById('albums-container');
    if (!container) return;

    container.innerHTML = '';

    if (albums.length === 0) {
        container.innerHTML = '<p>Aucun album disponible</p>';
        return;
    }

    albums.forEach(album => {
        const albumCard = document.createElement('div');
        albumCard.className = 'album-card';
        
        const imageUrl = `http://localhost:5000${album.file_path}`;
        
        albumCard.innerHTML = `
        <img src="${imageUrl}" alt="${album.name}" onerror="this.src='placeholder.jpg'">
        <div class="album-info">
            <h3>${album.name}</h3>
            <p>Titre: ${album.title}</p>
            <p>Artiste: ${album.artist}</p>
            <p>Année: ${album.year}</p>
        </div>
        <div class="album-actions">
            <button onclick="editAlbum(${album.id}, '${album.name}', '${album.title}', '${album.artist}', '${album.year}')" class="edit-btn">Modifier</button>
            <button onclick="deleteAlbum(${album.id})" class="delete-btn">Supprimer</button>
        </div>
    `;
        
        container.appendChild(albumCard);
    });
}

// Charger les albums quand on est sur la page myAlbums.html
if (window.location.pathname.includes('myAlbums.html')) {
    loadAlbums();
}

// Fonctions pour modifier les albums
function editAlbum(id, currentName, currentTitle, currentArtist, currentYear) {
    // Créer le formulaire de modification
    const form = document.createElement('form');
    form.className = 'edit-form';
    form.innerHTML = `
        <div class="modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div class="modal-content" style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                width: 300px;
            ">
                <h3>Modifier l'album</h3>
                <input type="text" name="name" placeholder="Nom" value="${currentName}" required><br>
                <input type="text" name="title" placeholder="Titre" value="${currentTitle}" required><br>
                <input type="text" name="artist" placeholder="Artiste" value="${currentArtist}" required><br>
                <input type="number" name="year" placeholder="Année" value="${currentYear}"><br>
                <div style="margin-top: 10px;">
                    <button type="submit" style="background: #4CAF50; color: white; margin-right: 10px;">Sauvegarder</button>
                    <button type="button" onclick="this.closest('.modal').remove()">Annuler</button>
                </div>
            </div>
        </div>
    `;

    // Gérer la soumission du formulaire
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            // Envoie une requête PUT à l'API pour mettre à jour l'album
            const response = await fetch(`http://localhost:5000/update_album/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',// Indique que nous envoyons des données JSON
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    title: formData.get('title'),
                    artist: formData.get('artist'),
                    year: formData.get('year')
                })
            });

            const result = await response.json();// Analyse la réponse JSON
            if (result.success) {
                form.remove();// Retire le formulaire de la page si l'album a été mis à jour
                loadAlbums(); // Recharge la liste des albums pour afficher les changements
            } else {
                alert('Erreur lors de la modification: ' + result.error);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification');
        }
    };

    document.body.appendChild(form);
}

// Fonction pour supprimer un album
function deleteAlbum(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) {
        fetch(`http://localhost:5000/delete_album/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())// Analyse la réponse JSON
        .then(data => {
            if (data.success) {
                loadAlbums(); // Recharger les albums
            }
        })
        .catch(error => console.error('Erreur:', error));
    }
}
// Fonction pour mettre à jour un album en envoyant une requête PUT
async function updateAlbum(albumId, name, artist, year) {
    const response = await fetch(`/update_album/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },// Spécifie que le corps de la requête est du JSON
        body: JSON.stringify({ name, artist, year })
    });
    
    if (response.ok) {
        alert('Album mis à jour avec succès !');
        getAlbums();
    } else {
        alert('Erreur lors de la mise à jour.');
    }
}
// Fonction pour ajouter un champ d'utilisateur autorisé (email) dans le formulaire
function addUserField() {
    const usersList = document.getElementById('users-list');
    const userDiv = document.createElement('div');
    userDiv.innerHTML = `
        <input type="email" name="authorized_users[]" placeholder="Email de l'utilisateur">
        <button type="button" onclick="this.parentElement.remove()">Supprimer</button>
    `;
    usersList.appendChild(userDiv);
}

// Charger la liste des événements
async function loadEvents() {
    try {
        const response = await fetch('http://localhost:5000/events');// Envoie une requête GET pour récupérer les événements
        const events = await response.json();
        const eventSelect = document.getElementById('event');// Récupère l'élément select pour les événements
        events.forEach(event => {
            const option = document.createElement('option');// Crée une nouvelle option pour chaque événement
            option.value = event.id;// Définit la valeur de l'option à l'id de l'événement
            option.textContent = event.name;
            eventSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}


 // Fonction de déconnexion
 function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

    window.deleteAlbum = deleteAlbum;
}