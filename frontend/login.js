document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === 'admin' && password === 'password123') {
        const authToken = 'exampleToken123'; 

        // Stocker le token dans le localStorage
        localStorage.setItem('authToken', authToken);

        window.location.href = 'index.html';  
    } else {
        document.getElementById('error-message').style.display = 'block';
    }
    
});
