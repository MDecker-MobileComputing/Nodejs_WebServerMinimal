/*
 * Diese Datei zeigt, wie einfach sich mit express.js ein Web-Server für die
 * Auslieferung von statischem Web-Content erstellen lässt.
 */

import express from 'express';


const PORT_NUMMER = 8080;

const app = express();

// statische Web-Dateien im Ordner "docs/" bereitstellen
app.use( express.static("docs/") );

app.listen( PORT_NUMMER,
            () => { console.log(`Web-Server auf Port ${PORT_NUMMER} gestartet.`); }
          );
