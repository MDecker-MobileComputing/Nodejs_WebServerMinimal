// In package.json muss "type"="module" sein, damit die folgende Import-Anweisung funktioniert.
import net from "net";


/**
 * Callback-Methode für Fehler bei der Kommunikation mit dem Client.
 */
function fehlerBehandeln(fehlerObjekt) {

    if (fehlerObjekt.code === "ECONNRESET") {

        console.log("Client hat Verbindung geschlossen\n");

    } else {

        console.error("Fehler: " + fehlerObjekt + "\n");
    }
}


const PORT_NUMMER=8080;

let server = net.createServer(socket => {

    socket.setEncoding("utf-8");
    socket.setNoDelay();

    socket.on("data", data => {

        console.log("HTTP-Request empfangen: ", data);

        socket.write('HTTP/1.1 200 OK\r\n');
        socket.write('Content-Type: text/html\r\n');
        socket.write('\r\n');
        socket.write('<html><body><h1>Hello, World!</h1></body></html>');
        console.log(`HTTP-Request von ${socket.remoteAddress} beantwortet.`);
        socket.end();
    });

    // Callback-Funktion für Fehler definieren
    socket.on("error", fehlerBehandeln );
});

console.log(`Web-Server lauscht auf Port ${PORT_NUMMER} ...\n`);
server.listen(PORT_NUMMER, "");
