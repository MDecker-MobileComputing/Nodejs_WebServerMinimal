/*
 * Diese Datei zeigt, wie einfach sich mit express.js ein Web-Server für die
 * Auslieferung von statischem Web-Content erstellen lässt.
 *
 * siehe auch: https://expressjs.com/en/5x/api.html#express.static
 *
 * express.js einem Projekt hinzufügen: npm install express
 */

import express from 'express';


const PORT_NUMMER = 8080;

const app = express();

// statische Web-Dateien im Ordner "docs/" bereitstellen
app.use( express.static( "docs/" ) );

app.listen( PORT_NUMMER,
            () => { console.log(`Web-Server auf Port ${PORT_NUMMER} gestartet.`); }
          );
