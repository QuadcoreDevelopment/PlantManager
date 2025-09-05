# Aufruf der einzelnen Services
- Die jeweiligen Services werden mit einem HTTP Request aufgerufen. Dieser ist wie folgt aufgebaut
    - `http://[serveradresse]:[port]/[backendname]/[servicename]/[servicemethode]/[opt.Werte]`
- Wenn Sie also z.B. den Service „Plants“ aufrufen wollen um Objekte aller Pflanzen zu erhalten verwenden Sie
    - `http://localhost:8000/api/plants/all`

# Übersicht über die einzelnen Serviceklassen
Folgende Serviceklassen sind implementiert und werden als sogenannte Endpoints eingebunden:
- plants
- activities

# HTTP Methoden
### GET 
Daten aus Datenbank abrufen
### POST 
Neuen Eintrag in Datenbank erzeugen
### PUT 
Bestehenden Eintrag in Datenbank ändern
### DELETE 
Bestehenden Eintrag in Datenbank löschen

# Namensschema der HTTP Methoden
Alle HTTP Aufrufe sind englisch und kleingeschrieben!
### Daten abrufen vom Backend (GET)
- Objekt vom Typ Plant mit der ID 3 holen
- http://localhost:8000/api/plants/get/3
### Alle Plant – Objekte holen
- http://localhost:8000/api/plants/all
### Prüfen ob ein Eintrag mit der ID 7 existiert
- http://localhost:8000/api/plants/exsists/7
### Neuen Eintrag erstellen (POST)
- http://localhost:8000/api/plants
- Wobei die Daten hier als JSON Objekt vom jeweiligen Typ geliefert werden müssen, ohne ID
### Bestehenden Eintrag ändern (PUT)
- http://localhost:8000/api/plants
- Wobei die Daten hier als JSON Objekt vom jeweiligen Typ geliefert werden müssen, mit ID
### Bestehenden Eintrag löschen (DELETE)
- http://localhost:8000/api/plants/4


# Daten an Servicemethoden senden
- Entweder als Teil des RESTFul Aufrufs (z.b. in Form einer ID)
    - http://localhost:8000/api/plants/get/2
- oder als
    - JSON Objekt,welches im HTTP Body übertragen wird
- Bei den JSON Objekten sind alle Eigentschaftsnamen ebenfalls kleingeschrieben.
- Manche Eigenschaften müssen Daten enthalten (sind also Pflicht), manche können leer bleiben und müssen auch nicht geschickt werden
- Manche sind nullbar.
- Beim Hinzufügen muss die id beispielsweise nicht mitgeschickt werden
- Beim Editieren muss die ID aber zwingend mit geschickt werden

# Daten vom Service zurückerhalten
- Alles was vom Backend zurück geliefert wird, ist immer ein JSON Objekt.
- Es gibt prinzipiell zwei Typen von Objekten. 
- Im Erfolgsfall, wenn die Verarebeitung geklappt hat, ein Objekt mit den angeforderten Daten. 
- Oder im Fehlerfall ein Objekt mit einer Fehlermeldung

## Beispiel im Erfolgsfall
```JSON
{
    <Daten>
}
```

## Beispiel im Fehlerfall
```JSON
{
    "nachricht": "Fehler: name fehlt",
    "fehler": true,
    "daten": null
}
```

# Details zu Services
## Plants
- GET
    - `…/api/plants/get/[id]`
    - Liefert ein JSON Objekt vom Typ Plant für die angegebene [id]
- GET
    - `…/api/plants/all`
    - Liefert alle JSON Objekte vom Typ Plant
- GET
    - `…/api/plants/exists/[id]`
    - Prüft nach, ob ein Objekt vom Typ Plant unter dieser [id] existiert
    - Liefert true oder false zurück
- POST
    - `…/api/plants`
    - Fügt die als JSON gesendeten Daten als neues Objekt hinzu
    - Liefert das neu erstellte JSON Objekt vom Typ Plant zurück
- PUT
    - `…/api/plants`
    - Ändert einen bestehenden JSON Objekt anhand der gesendeten Daten
    - Liefert das geänderte JSON Objekt vom Typ Plant zurück
- DELETE
    - `…/api/plants/[id]`
    - Löscht das durch die [id] spezifizierte JSON Objekt vom Typ Plant und liefert true zurück
    - Falls vorhanden, werden auch alle zur Pflanze gehörigen Activities gelöscht

### Objekt vom Typ Plant
Beispiel:
```JSON
{
    "plant_id": 3,
    "name": "Pflanziska",
    "species_name": "Glücksfeder",
    "image": "1.png",
    "added": "2023-03-14",
    "watering_interval": 14,
    "watering_interval_offset": -3,
    "watering_interval_calculated": 11,
    "days_since_watering": 10,
    "days_until_watering": 1,
    "repotted": "2023-03-14",
    "composted": null
}
```
### Attribute
- id
    - Eindeutiger Primärschlüssel des Objektes
    - Typ: Integer
    - Pflichtfeld bei: PUT und GET
    - Nullbar: nein
    - Defaultwert: generiert durch DB bei POST
- name
    - Eindeutig
    - Typ: Text
    - Pflichtfeld bei: PUT und POST
    - Nullbar: nein
- species_name
    - Typ: Text
    - Pflichtfeld bei: PUT und POST
    - Nullbar: nein
- image
    - Typ: Text
    - Pflichtfeld bei: nie
    - is only set by the upload service, see #37
    - Nullbar: ja
- added
    - Typ: Text(Datum)
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Defaultwert: generiert durch DB bei POST
- watering_interval
    - Typ: Integer
    - Pflichtfeld bei: PUT und POST
    - Nullbar: nein
    - Defaultwert: 7
    - Wie häufig die Pflanze gegossen werden muss in Tagen
- watering_interval_offset
    - Typ: Integer
    - Pflichtfeld bei: PUT und POST
    - Nullbar: nein
    - Defaultwert: 0
    - kann auch negativ sein
    - Repräsentiert den Standort
    - Wird auf den Interval addiert
- watering_interval_calculated
    - Typ: Integer
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Berechneter Wert aus Interval Plus Offset
- days_since_watering
    - Typ: Integer
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Durch Backend berechneter Wert
    - Tage seit letztem gießen
- days_since_watering
    - Typ: Integer
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Durch Backend berechneter Wert
    - Tage bis nächstes gießen
    - kann auch negativ sein, wenn gießen überfällig
- repotted
    - Typ: Text(Datum)
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Durch Backend berechneter Wert
    - Datum des letzten Umtopfen
    - Wenn noch nie umgetopft Datum des hinzufügens
- composted
    - Typ: Text(Datum)
    - Pflichtfeld bei: nie
    - Nullbar: ja
    - Datum des soften-löschens
    - Wenn die Pflanze noch nicht soft-gelöscht wurde null

## Activities
- GET
    - `…/api/activities/all/[plant_id]`
    - Liefert alle JSON Objekte vom Typ Activity für die angegebene Pflanze mit der [plant_id]
- GET
    - `…/api/activities/exists/[id]`
    - Prüft nach, ob ein Objekt vom Typ Activity unter dieser [id] existiert
    - Liefert true oder false zurück
- POST
    - `…/api/activities`
    - Fügt die als JSON gesendeten Daten als neues Objekt hinzu
    - Liefert das neu erstellte JSON Objekt vom Typ Activity zurück
- DELETE
    - `…/api/activities/[id]`
    - Löscht das durch die `[id]` spezifizierte JSON Objekt vom Typ Activity und liefert true zurück

### Objekt vom Typ Activity
Beispiel:
```JSON
{
    "id": 12,
    "plant_id": 3,
    "type": 0,
    "date": "2023-03-25",
    "days_since": 2
}
```
### Attribute
- id
    - Eindeutiger Primärschlüssel des Objektes
    - Typ: Integer
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Defaultwert: generiert durch DB bei POST
- plant_id
    - Eindeutiger Fremdschlüssel der dazugehörigen Pflanze
    - Typ: Integer
    - Pflichtfeld bei: POST
    - Nullbar: nein
    - Defaultwert: keinen
- type
    - 0=Gießen, 1=Umtopfen
    - Typ: Integer
    - Pflichtfeld bei: POST
    - Nullbar: nein
- date
    - Typ: Text(Datum)
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Defaultwert: generiert durch DB bei POST
- days_since
    - Typ: Integer
    - Pflichtfeld bei: nie
    - Nullbar: nein
    - Durch Backend berechneter Wert
    - Tage seit dieser Activity


## Upload
- PUT
    - `…/api/upload/image`
    - Speichert das im Body mit gesendete Bild auf dem Server unter: `/public/images/plants/<plant_id>.<typ>`
    - hinterlegt das Bild bei der Pflanze mit der angegebenen `plant_id`
    - Pflicht Felder: `picture` und `plant_id`