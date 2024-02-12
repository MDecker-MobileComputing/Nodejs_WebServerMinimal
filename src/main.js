// In package.json muss "type"="module" sein, damit die folgende Import-Anweisung funktioniert.
import net from "net";


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


const PORT_NUMMER=8080;
const HTTP_ZEILENENDE= "\r\n";


let server = net.createServer(socket => {

    socket.setEncoding("utf-8");
    socket.setNoDelay();

    socket.on("data", daten => {

        console.log("HTTP-Request empfangen: ", daten);

        const requestTokenArray = extrahiereRequestZeile(daten);
        const httpVerb = requestTokenArray[0];
        if (httpVerb !== "GET") {

            console.log(`FEHLER: HTTP-Verb \"${httpVerb}\" wird nicht unterstützt.`);
        }
        const pfadZuRessource = requestTokenArray[1];

        socket.write("HTTP/1.1 200 OK"         + HTTP_ZEILENENDE);
        socket.write("Content-Type: text/html" + HTTP_ZEILENENDE);

        socket.write(HTTP_ZEILENENDE); // Leerzeile zwischen Header und Body

        socket.write("<html><body>"                                             + HTTP_ZEILENENDE);
        socket.write(`<h1>Datei/Ressource angefordert: ${pfadZuRessource}</h1>` + HTTP_ZEILENENDE);
        socket.write("</body></html>"                                           + HTTP_ZEILENENDE);

        socket.end();
        console.log(`HTTP-Request von ${socket.remoteAddress} beantwortet.`);
    });

    // Callback-Funktion für Fehler definieren
    socket.on("error", fehlerBehandeln );
});


// Server starten
console.log(`Web-Server lauscht auf Port ${PORT_NUMMER} ...\n`);
server.listen(PORT_NUMMER, "");
