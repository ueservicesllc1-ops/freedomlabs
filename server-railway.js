const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static('.'));

// Handle specific routes
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/contacto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacto.html'));
});

app.get('/quienes-somos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'quienes-somos.html'));
});

app.get('/terminos-condiciones.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'terminos-condiciones.html'));
});

app.get('/politica-privacidad.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'politica-privacidad.html'));
});

app.get('/portfolio.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'portfolio.html'));
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
