// Configuration for Kiwi Navigator

const CONFIG = {
    // Mapbox Configuration
    mapbox: {
        // IMPORTANT: Replace with your Mapbox token
        // Get it from: https://account.mapbox.com/access-tokens/
        accessToken: 'YOUR_MAPBOX_TOKEN_HERE', // TODO: Add your token or use .env

        // Map Style
        style: 'mapbox://styles/mapbox/streets-v12', // Clean, readable streets

        // Default Center: Auckland, New Zealand
        center: [174.7633, -36.8485], // [lng, lat]
        zoom: 12,

        // Navigation Settings
        profile: 'mapbox/driving', // driving, walking, cycling, driving-traffic

        // Geocoding (search) settings
        geocoder: {
            countries: 'NZ', // Restrict to New Zealand
            proximity: [174.7633, -36.8485], // Bias results to Auckland
            placeholder: 'Search destination...',
            bbox: [174.6, -37.0, 175.0, -36.7] // Auckland bounding box
        }
    },

    // Navigation Settings
    navigation: {
        // Distance thresholds (meters)
        arrivalThreshold: 50, // Consider "arrived" within 50m
        offRouteThreshold: 100, // Recalculate if 100m off route
        turnAnnouncementDistance: 200, // Announce turn at 200m

        // Update intervals (milliseconds)
        positionUpdateInterval: 1000, // Update position every second
        routeCheckInterval: 5000, // Check if off-route every 5 seconds

        // Voice announcement settings
        announceEveryMeters: 500, // Announce progress every 500m on long stretches
    },

    // Voice Settings
    voice: {
        enabled: true,
        rate: 1.0, // Speech rate (0.1 to 10)
        pitch: 1.0, // Speech pitch (0 to 2)
        volume: 1.0, // Volume (0 to 1)

        // Preferred voices (browser-dependent)
        preferredVoices: {
            'kiwi-mate': 'Google UK English Male',
            'sarcastic': 'Google US English',
            'zen': 'Google UK English Female',
            'professional': 'Microsoft David Desktop'
        }
    },

    // Auckland Specific Settings
    auckland: {
        // Popular destinations for quick access
        quickDestinations: [
            { name: 'Sky Tower', coords: [174.7633, -36.8485] },
            { name: 'Viaduct Harbour', coords: [174.7644, -36.8423] },
            { name: 'Queen Street', coords: [174.7633, -36.8506] },
            { name: 'Auckland Domain', coords: [174.7774, -36.8617] },
            { name: 'Mission Bay', coords: [174.8367, -36.8544] }
        ],

        // Local tips
        parkingDifficultAreas: [
            'Ponsonby Road',
            'Queen Street CBD',
            'Viaduct Harbour',
            'Newmarket'
        ]
    },

    // SwipeRight Integration (future)
    swiperight: {
        enabled: false, // Enable when API is ready
        apiUrl: 'https://api.swiperight.nz',
        apiKey: '' // Add via .env
    },

    // Debug Mode
    debug: true // Set to false in production
};

// Helper function to load token from .env or prompt user
function loadMapboxToken() {
    // In production, you'd load from environment variables
    // For now, check if token is set
    if (CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
        console.warn('⚠️ MAPBOX TOKEN NOT SET!');
        console.log('Get your free token from: https://account.mapbox.com/access-tokens/');
        console.log('Add it to scripts/config.js or use environment variables');
    }
    return CONFIG.mapbox.accessToken;
}

// Validate configuration on load
function validateConfig() {
    const token = loadMapboxToken();
    if (!token || token === 'YOUR_MAPBOX_TOKEN_HERE') {
        alert('🗺️ Mapbox token required!\n\nGet your free token from:\nhttps://account.mapbox.com/access-tokens/\n\nThen add it to scripts/config.js');
        return false;
    }
    return true;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
