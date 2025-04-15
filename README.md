![alt text](frontend/images/logo_light.svg)

# PlantManager
- Eine mit Node.js, Bootstrap, CSS und HTML entwickelte Webanwendung zur einfachen Verwaltung von Zimmerpflanzen
- starten mit `npm start`
- im Dev-Mode starten mit `npm run dev`

## Anforderungen
NodeJS 22.3.0

### Benötigte Pakete in Node.js
- express - der Webserver selbst
- body-parser - Middleware zum Parsen von Requests
- express-fileupload - Middleware für Dateiuploads
- better-sqlite3 - Library für die SQLITE Datenbankanbindung
- cors - Middleware für CORS Requests
- morgan - Middleware zum loggen von HTTP Requests
- lodash - Middleware für Hilfsfunktionen
- nodemon - Erkennt das automatische starten der Serversoftware
- md5 - Hashing Funktionen
- luxon - Immutable data wrapper Middleware
- jsonwebtoken - Library zum erstellen und validieren von Webtokens

## Verzeichnisstruktur
- `\Backend`
		Die Hauptdatei des Servers sowie Hilfsbibliotheken
	- `\dao`
			Die Klassen, welche zum Zugriff auf die Datenbanktabellen verwendet werden
	- `\db`
			Die SQLite Datenbankdatei und sql Dateien
	- `\node_modules`
			Die Node.js Bibliotheken, aktualisieren mit dem Befehl "npm update"
	- `\public`
			alle statischen Dateien wie Bilder oder PDFs welche zugreifbar sein sollen
	- `\services`
			Die Klassen, welche die einzelnen Services umsetzen

## Development Mode
Während der Entwicklungszeit kommt es oft vor, dass Sie das Backend wegen Änderungen öfters starten müssen. Um hier eine Erleichterung zu haben wurde das Paket "nodemon" mit ins Projekt integriert. 
Dieses erkennt "automatisch", wenn sich Änderungen im Code ergeben und startet den Server neu.
Aufruf über die node.js Konsole: `npm run dev`

Sollte die Automatik bei Änderungen versagen, können Sie den Server auch über rs und Enter in der Konsole neu starten oder die Serverinstanz abbrechen und manuell neu starten.

Wenn Sie mit der Entwicklung fertig sind könnnen Sie den Server im Produktiv-Modus starten mit dem Befehl: `npm start`
	
Dann können Sie die Dateien im Ordner frontend mit einem Browser ausführen.
Denken Sie daran beim Browser die Konsole sichtbar zu haben.