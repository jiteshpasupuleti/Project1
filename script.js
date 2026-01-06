let map;
let markers = [];

map = L.map('map').setView([20.5937, 78.9629], 5);

// OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function searchLocation() {
    const location = document.getElementById("locationInput").value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                alert("Location not found");
                return;
            }

            const lat = data[0].lat;
            const lon = data[0].lon;

            map.setView([lat, lon], 13);
            clearMarkers();
            clearLists();

            L.marker([lat, lon]).addTo(map)
                .bindPopup(location)
                .openPopup();

            fetchPlaces(lat, lon);
        });
}

function fetchPlaces(lat, lon) {
    const query = `
    [out:json];
    (
      node(around:5000,${lat},${lon})["amenity"="school"];
      node(around:5000,${lat},${lon})["amenity"="college"];
      node(around:5000,${lat},${lon})["tourism"="attraction"];
    );
    out body;
    `;

    fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    })
    .then(res => res.json())
    .then(data => {
        data.elements.forEach(place => {
            const name = place.tags.name || "Unnamed place";
            let listId = "";

            if (place.tags.amenity === "school") listId = "schoolsList";
            else if (place.tags.amenity === "college") listId = "collegesList";
            else listId = "placesList";

            const li = document.createElement("li");
            li.textContent = name;
            document.getElementById(listId).appendChild(li);

            const marker = L.marker([place.lat, place.lon]).addTo(map)
                .bindPopup(name);

            li.onclick = () => {
                map.setView([place.lat, place.lon], 15);
                marker.openPopup();
            };

            markers.push(marker);
        });
    });
}

function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

function clearLists() {
    document.getElementById("schoolsList").innerHTML = "";
    document.getElementById("collegesList").innerHTML = "";
    document.getElementById("placesList").innerHTML = "";
}

