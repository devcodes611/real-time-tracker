const socket = io('https://real-time-tracker-five.vercel.app');

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', { latitude, longitude });
    }, (error) => {
        console.log('Geolocation error:', error);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000, // Increased timeout
    });
}

const map = L.map('map').setView([0, 0], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'devraj sawant'
}).addTo(map);

const markers = {};
const colors = ['red', 'blue', 'green', 'purple', 'orange']; // Array of colors

// Function to generate a unique color for each marker
function getColor(id) {
    const colorIndex = Math.abs(parseInt(id, 16)) % colors.length;
    return colors[colorIndex];
}

socket.on('received-location', (data) => {
    console.log('Received location:', data); // Log received data for debugging
    const { id, latitude, longitude } = data;

    if (Object.keys(markers).length === 0) {
        map.setView([latitude, longitude], 15);
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a colored marker with tooltip
        const marker = L.marker([latitude, longitude], {
            icon: L.divIcon({
                className: 'custom-icon',
                html: `<div style="background-color: ${getColor(id)}; width: 20px; height: 20px; border-radius: 50%;"></div>`,
                iconSize: [20, 20],
            }),
        }).addTo(map);
        
        // Add tooltip with user ID, shown only on hover or click
        marker.bindTooltip(id, {
            permanent: false,
            direction: 'top',
            className: 'user-id-tooltip',
            opacity: 0 // Hidden by default
        });

        marker.on('click', function() {
            marker.openTooltip(); // Open tooltip on click
        });
        
        marker.on('mouseover', function() {
            marker.openTooltip(); // Open tooltip on hover
        });
        
        marker.on('mouseout', function() {
            marker.closeTooltip(); // Close tooltip when mouse leaves
        });

        markers[id] = marker;
    }
});

socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
