// Mapbox GL JS Integration for Kiwi Navigator

class MapManager {
    constructor() {
        this.map = null;
        this.geocoder = null;
        this.userMarker = null;
        this.destinationMarker = null;
        this.routeLayer = null;
        this.currentLocation = null;
        this.destination = null;
        this.watchId = null;
    }

    // Initialize map
    async init() {
        // Validate token
        if (!validateConfig()) {
            return false;
        }

        // Set Mapbox access token
        mapboxgl.accessToken = CONFIG.mapbox.accessToken;

        // Create map instance
        this.map = new mapboxgl.Map({
            container: 'map',
            style: CONFIG.mapbox.style,
            center: CONFIG.mapbox.center,
            zoom: CONFIG.mapbox.zoom,
            pitch: 0, // Tilt angle (0-60)
            bearing: 0 // Rotation
        });

        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
        this.geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        this.map.addControl(this.geolocateControl, 'top-right');

        // Wait for map to load
        await new Promise((resolve) => {
            this.map.on('load', resolve);
        });

        // Initialize geocoder (search)
        this.initGeocoder();

        // Get user location
        this.startLocationTracking();

        console.log('✅ Map initialized');
        return true;
    }

    // Initialize geocoder (search box)
    initGeocoder() {
        this.geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            marker: false, // We'll add our own marker
            countries: CONFIG.mapbox.geocoder.countries,
            proximity: {
                longitude: CONFIG.mapbox.geocoder.proximity[0],
                latitude: CONFIG.mapbox.geocoder.proximity[1]
            },
            bbox: CONFIG.mapbox.geocoder.bbox,
            placeholder: CONFIG.mapbox.geocoder.placeholder
        });

        // Add geocoder to page
        document.getElementById('geocoder').appendChild(this.geocoder.onAdd(this.map));

        // Listen for result selection
        this.geocoder.on('result', (e) => {
            this.handleDestinationSelect(e.result);
        });
    }

    // Start tracking user location
    startLocationTracking() {
        if (!navigator.geolocation) {
            alert('Geolocation not supported by your browser');
            return;
        }

        // Request permission and start tracking
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.updateUserLocation({
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Fall back to Auckland center
                this.updateUserLocation({
                    lng: CONFIG.mapbox.center[0],
                    lat: CONFIG.mapbox.center[1]
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Also trigger geolocate control
        this.geolocateControl.trigger();
    }

    // Update user location marker
    updateUserLocation(coords) {
        this.currentLocation = coords;

        // Remove old marker
        if (this.userMarker) {
            this.userMarker.remove();
        }

        // Create new marker
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.background = '#2563eb';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        this.userMarker = new mapboxgl.Marker(el)
            .setLngLat([coords.lng, coords.lat])
            .addTo(this.map);

        // Center map on user (first time only)
        if (!this.destination) {
            this.map.flyTo({
                center: [coords.lng, coords.lat],
                zoom: 14
            });
        }

        if (CONFIG.debug) {
            console.log('📍 Location updated:', coords);
        }
    }

    // Handle destination selection from search
    handleDestinationSelect(result) {
        const coords = {
            lng: result.center[0],
            lat: result.center[1]
        };

        this.destination = {
            coords: coords,
            name: result.place_name,
            address: result.place_name
        };

        // Add destination marker
        this.addDestinationMarker(coords, result.place_name);

        // Hide search overlay
        document.getElementById('search-overlay').classList.add('hidden');

        // Calculate route
        this.calculateRoute();

        console.log('🎯 Destination selected:', this.destination);
    }

    // Add destination marker
    addDestinationMarker(coords, name) {
        // Remove old marker
        if (this.destinationMarker) {
            this.destinationMarker.remove();
        }

        // Create marker element
        const el = document.createElement('div');
        el.innerHTML = '📍';
        el.style.fontSize = '32px';

        // Add marker
        this.destinationMarker = new mapboxgl.Marker(el)
            .setLngLat([coords.lng, coords.lat])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${name}</strong>`)
            )
            .addTo(this.map);
    }

    // Calculate route using Mapbox Directions API
    async calculateRoute() {
        if (!this.currentLocation || !this.destination) {
            console.error('Missing location or destination');
            return null;
        }

        const start = [this.currentLocation.lng, this.currentLocation.lat];
        const end = [this.destination.coords.lng, this.destination.coords.lat];

        // Build Directions API URL
        const url = `https://api.mapbox.com/directions/v5/${CONFIG.mapbox.profile}/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=false&geometries=geojson&steps=true&banner_instructions=true&voice_instructions=true&access_token=${mapboxgl.accessToken}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];

                // Store route data
                this.currentRoute = route;

                // Draw route on map
                this.drawRoute(route.geometry);

                // Fit map to show entire route
                this.fitToRoute(route.geometry);

                // Update UI with route info
                this.updateRouteInfo(route);

                // Show navigation panel
                document.getElementById('nav-panel').classList.remove('hidden');

                console.log('🛣️ Route calculated:', route);
                return route;
            }
        } catch (error) {
            console.error('Route calculation error:', error);
            alert('Failed to calculate route. Please try again.');
            return null;
        }
    }

    // Draw route on map
    drawRoute(geometry) {
        // Remove existing route layer
        if (this.map.getSource('route')) {
            this.map.removeLayer('route');
            this.map.removeSource('route');
        }

        // Add route as a layer
        this.map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: geometry
            }
        });

        this.map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#2563eb',
                'line-width': 6,
                'line-opacity': 0.8
            }
        });
    }

    // Fit map to show entire route
    fitToRoute(geometry) {
        const coordinates = geometry.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        this.map.fitBounds(bounds, {
            padding: { top: 100, bottom: 300, left: 50, right: 50 }
        });
    }

    // Update route info in UI
    updateRouteInfo(route) {
        // Distance in km
        const distanceKm = (route.distance / 1000).toFixed(1);
        document.getElementById('nav-distance').textContent = `${distanceKm} km`;

        // Duration in minutes
        const durationMin = Math.round(route.duration / 60);
        document.getElementById('nav-duration').textContent = `${durationMin} min`;

        // Destination name
        document.getElementById('destination-name').textContent = this.destination.name;
    }

    // Recenter map on user location
    recenterMap() {
        if (this.currentLocation) {
            this.map.flyTo({
                center: [this.currentLocation.lng, this.currentLocation.lat],
                zoom: 16,
                pitch: 45,
                bearing: 0
            });
        }
    }

    // Clear current route and destination
    clearRoute() {
        // Remove route layer
        if (this.map.getSource('route')) {
            this.map.removeLayer('route');
            this.map.removeSource('route');
        }

        // Remove destination marker
        if (this.destinationMarker) {
            this.destinationMarker.remove();
            this.destinationMarker = null;
        }

        // Reset destination
        this.destination = null;
        this.currentRoute = null;

        // Show search overlay
        document.getElementById('search-overlay').classList.remove('hidden');

        // Hide nav panel
        document.getElementById('nav-panel').classList.add('hidden');
    }

    // Cleanup
    destroy() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        if (this.map) {
            this.map.remove();
        }
    }
}

// Initialize map manager
const mapManager = new MapManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapManager, mapManager };
}
