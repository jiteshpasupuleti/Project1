function searchLocation() {
    const location = document.getElementById("locationInput").value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                alert("Location not found");
                return;
            }

            const lat = data[0].lat;
            const lon = data[0].lon;

            document.getElementById("map").src =
                `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05}%2C${lat-0.05}%2C${lon+0.05}%2C${lat+0.05}&layer=mapnik&marker=${lat}%2C${lon}`;

            loadPlaces(lat, lon);
        });
}

function loadPlaces(lat, lon) {
    document.getElementById("schools").innerHTML = "";
    document.getElementById("places").innerHTML = "";

    const query = `
    [out:json];
    (
      node(around:5000,${lat},${lon})["amenity"="school"];
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
        data.elements.forEach(p => {
            const name = p.tags.name || "Unnamed";

            const li = document.createElement("li");
            li.textContent = name;

            if (p.tags.amenity === "school") {
                document.getElementById("schools").appendChild(li);
            } else {
                document.getElementById("places").appendChild(li);
            }
        });
    });
}
