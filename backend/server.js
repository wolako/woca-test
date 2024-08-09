// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Middleware pour activer CORS
app.use(cors());

// Configuration de la connexion à MySQL avec createPool()
const pool = mysql.createPool({
  host: 'localhost',
  user: 'wola',
  password: 'wolako',
  database: 'formulaire'
});

// Configuration de Nodemailer pour utiliser Mailtrap
const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'd4be066ea5295a',
      pass: 'db1b775ac89b27'
    }
});

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Endpoint pour ajouter un nouveau contact
app.post('/formulaire', async (req, res) => {
  const { nom, prenom, email, sujet, message } = req.body;
  try {
    // Obtenir une connexion à partir du pool
    const connection = await pool.getConnection();
    // Exécuter la requête SQL
    const [results, fields] = await connection.execute('INSERT INTO formulaire (nom, prenom, email, sujet, message) VALUES (?, ?, ?, ?, ?)', [nom, prenom, email, sujet, message]);
    // Libérer la connexion
    connection.release();
    // Envoyer une notification par e-mail
    await transporter.sendMail({
        from: 'from@example.com',
        to: 'wolakoluvb@gmail.com',
        subject: 'Nouveau message depuis le formulaire de contact',
        text: `Vous avez reçu un nouveau message de ${nom} ${prenom} (${email}).\n\nSujet: ${sujet}\n\nMessage: ${message}`
    });
    // Envoyer une réponse au client
    res.status(201).json({ message: 'Contact enregistré avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du contact' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
