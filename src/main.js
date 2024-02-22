// In package.json muss "type"="module" sein, damit die folgende Import-Anweisungen funktionieren
import net from "net";
import fs  from "fs";


/**
 * Diese Funktion liest eine Datei basierend auf der angeforderten Ressource.
 *
 * @param {string} angeforderteRessource - Der Pfad zur angeforderten Ressource,
 *                                         relativ zum Verzeichnis `docs` Verzeichnis.
 *                                         Es wurde `docs` als Root-Verzeichnis für den
 *                                         Web-Content definiert, damit er zum Vergleich
 *                                         auch mit *GitHub Pages* aufgerufen werden kann.
 *
 * @returns {Buffer|null} Die Datei-Inhalte als Buffer, oder `null`, wenn die Datei nicht
 *                        gelesen werden konnte.
 */
function holeDatei(angeforderteRessource) {

    let relativerPfad = "./docs" + angeforderteRessource;
    if (relativerPfad.endsWith("/")) {

        relativerPfad += "/index.html";
    }

    try {

        return fs.readFileSync(relativerPfad);

    } catch (err) {

        console.error(`Fehler beim Lesen der Datei "${relativerPfad}": ${err.message}`);
        return null;
    }
}


/**
 * Funktion liefert den Wert für das Header-Feld `Content-Type` basierend auf der Dateiendung
 * der angeforderten Ressource.
 *
 * Browser können nur Dateien verarbeiten, wenn sie den korrekten Content-Type haben.
 * Beispielsweise werden CSS-Dateien nicht ausgewertet, wenn sie nicht mit dem MIME-Typ `text/css`
 * ausgeliefert werden.
 *
 * @param {*} angeforderteRessource - Pfad zur angeforderten Ressource, für die der CSS-Content-Type
 *                                    ermittelt werden soll.
 *
 * @returns Wert für Header-Felder `Content-Type`, basierend auf der Datei-Endung der angeforderten
 *          Ressource, z.B. `text/html` für `.html`-Dateien oder `text/css` für `.css`-Dateien.
 *          Wenn die Dateiendung nicht bekannt ist, wird `text/plain` zurückgegeben.
 */

function getMediaTypeFuerDatei(angeforderteRessource) {

    if (angeforderteRessource.endsWith("/")) {

        return "text/html";
    }
    const dateiendung = angeforderteRessource.split('.').pop().toLowerCase();
    switch (dateiendung) {

        case "html":
        case "htm" : return "text/html";
        case "css" : return "text/css";
        case "js"  : return "application/javascript";
        case "png" : return "image/png";
        case "jpg" :
        case "jpeg": return "image/jpeg";
        case "gif" : return "image/gif";
        case "svg" : return "image/svg+xml";
        default: return "text/plain";
    }
}


/**
 * Callback-Methode für Fehler bei der Kommunikation mit dem Client.
 */
function fehlerBehandeln(fehlerObjekt) {

    if (fehlerObjekt.code === "ECONNRESET") {

        console.log( "Client hat Verbindung geschlossen.\n" );

    } else {

        console.error( `Fehler: ${fehlerObjekt.message}\n` );
    }
}


/**
 * Funktion liefert die Token der ersten Zeile eines HTTP-Requests
 * als Array zurück, also v.a. HTTP-Verb und den Pfad zur Ressource.
 * <br>
 *
 * Beispiel für erste Zeile im HTTP-Request:
 * ```
 * GET /pfad/seite.html HTTP/1.1
 * ```
 *
 * @param {*} daten Von HTTP-Client über TCP/IP erhaltener Request
 * @returns Array mit Komponenten der ersten Zeile im HTTP-Request:
 *          HTTP-Verb (z.B. `GET`),
 *          Pfad (Request URI, z.B. `/pfad/seite.html`),
 *          Protokoll (z.B. `HTTP/1.1`)
 */
function extrahiereRequestZeile(daten) {

    const zeilenArray = daten.split("\n");
    const ersteZeile  = zeilenArray[0];

    return ersteZeile.split(" ");
}


const PORT_NUMMER     = 8080;
const HTTP_ZEILENENDE = "\r\n";

// Server mit Callback-Funktion für eingehende Verbindungen
let server = net.createServer(socket => {

    socket.setEncoding("utf-8");
    socket.setNoDelay();

    socket.on("data", daten => {

        console.log("HTTP-Request empfangen: ", daten);

        const requestTokenArray = extrahiereRequestZeile(daten);
        const httpVerb = requestTokenArray[0];
        if (httpVerb !== "GET") {

            console.log(`FEHLER: HTTP-Verb \"${httpVerb}\" wird nicht unterstützt.`);
            socket.write("HTTP/1.1 405 Method Not Allowed" + HTTP_ZEILENENDE); // https://http.cat/status/405
            socket.write("Allow: GET")

        } else { // HTTP-GET

            const pfadZuRessource = requestTokenArray[1];

            const datei = holeDatei(pfadZuRessource);
            if (datei) {

                socket.write("HTTP/1.1 200 OK" + HTTP_ZEILENENDE);

                const contentType = getMediaTypeFuerDatei(pfadZuRessource);
                socket.write(`Content-Type: ${contentType}${HTTP_ZEILENENDE}`);

                socket.write(HTTP_ZEILENENDE); // Leerzeile zwischen Header und Body

                socket.write(datei);

            } else { // Datei nicht gefunden

                    socket.write("HTTP/1.1 404 Not Found" + HTTP_ZEILENENDE);
            }
        }

        socket.end();
        console.log(`HTTP-Request von ${socket.remoteAddress} beantwortet.`);
    });

    // Callback-Funktion für Fehler definieren
    socket.on("error", fehlerBehandeln );
});


// Server starten
console.log(`Web-Server lauscht auf Port ${PORT_NUMMER} ...\n`);
server.listen(PORT_NUMMER, "");
