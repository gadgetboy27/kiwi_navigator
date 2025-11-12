// Main Application Logic for Kiwi Navigator

class KiwiNavigator {
    constructor() {
        this.initialized = false;
    }

    // Initialize app
    async init() {
        console.log('🥝 Kiwi Navigator starting...');

        // Initialize map
        const mapInitialized = await mapManager.init();
        if (!mapInitialized) {
            console.error('Failed to initialize map');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();

        // Load saved voice preference
        this.updateVoiceDisplay();

        // Initialize voice modal
        this.populateVoiceModal();

        this.initialized = true;
        console.log('✅ Kiwi Navigator ready!');
    }

    // Set up all event listeners
    setupEventListeners() {
        // Voice selector button
        document.getElementById('voice-selector-btn').addEventListener('click', () => {
            this.showVoiceModal();
        });

        // Start navigation button
        document.getElementById('start-nav-btn').addEventListener('click', () => {
            this.startNavigation();
        });

        // End navigation button
        document.getElementById('end-nav-btn').addEventListener('click', () => {
            this.endNavigation();
        });

        // Mute button
        document.getElementById('mute-btn').addEventListener('click', () => {
            this.toggleMute();
        });

        // Recenter button
        document.getElementById('recenter-btn').addEventListener('click', () => {
            mapManager.recenterMap();
        });

        // Modal close buttons
        document.getElementById('modal-close').addEventListener('click', () => {
            this.hideVoiceModal();
        });

        document.getElementById('arrival-close').addEventListener('click', () => {
            this.hideArrivalScreen();
        });

        // Arrival screen buttons
        document.getElementById('new-destination-btn').addEventListener('click', () => {
            this.startNewJourney();
        });

        document.getElementById('rate-journey-btn').addEventListener('click', () => {
            this.rateJourney();
        });

        // Close modals on background click
        document.getElementById('voice-modal').addEventListener('click', (e) => {
            if (e.target.id === 'voice-modal') {
                this.hideVoiceModal();
            }
        });

        document.getElementById('arrival-screen').addEventListener('click', (e) => {
            if (e.target.id === 'arrival-screen') {
                this.hideArrivalScreen();
            }
        });
    }

    // Populate voice selection modal
    populateVoiceModal() {
        const voiceOptions = document.querySelector('.voice-options');
        voiceOptions.innerHTML = '';

        for (const [id, character] of Object.entries(VOICE_CHARACTERS)) {
            const isSelected = id === voiceManager.currentVoice;
            const isLocked = character.locked;

            const optionDiv = document.createElement('div');
            optionDiv.className = `voice-option ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;

            optionDiv.innerHTML = `
                <div class="voice-emoji">${character.emoji}</div>
                <div class="voice-details">
                    <div class="voice-name">
                        ${character.name}
                        ${isLocked ? '<span class="voice-badge">🔒 PRO</span>' : ''}
                    </div>
                    <div class="voice-tagline">${character.tagline}</div>
                </div>
                <div class="voice-actions">
                    ${!isLocked ? `<button class="btn-preview" data-voice="${id}">▶️ Preview</button>` : ''}
                    ${isSelected ? '<span class="checkmark">✓</span>' : ''}
                </div>
            `;

            // Click to select (if not locked)
            if (!isLocked) {
                optionDiv.addEventListener('click', (e) => {
                    // Don't trigger if clicking preview button
                    if (!e.target.classList.contains('btn-preview')) {
                        this.selectVoice(id);
                    }
                });
            }

            // Preview button
            const previewBtn = optionDiv.querySelector('.btn-preview');
            if (previewBtn) {
                previewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    voiceManager.preview(id);
                });
            }

            voiceOptions.appendChild(optionDiv);
        }
    }

    // Show voice modal
    showVoiceModal() {
        document.getElementById('voice-modal').classList.remove('hidden');
    }

    // Hide voice modal
    hideVoiceModal() {
        document.getElementById('voice-modal').classList.add('hidden');
    }

    // Select a voice character
    selectVoice(voiceId) {
        if (voiceManager.selectVoice(voiceId)) {
            this.updateVoiceDisplay();
            this.populateVoiceModal(); // Refresh to show checkmark
            console.log(`Voice changed to: ${VOICE_CHARACTERS[voiceId].name}`);
        }
    }

    // Update voice display in header
    updateVoiceDisplay() {
        const currentVoice = voiceManager.getCurrentVoice();
        document.getElementById('current-voice-emoji').textContent = currentVoice.emoji;
        document.getElementById('current-voice-name').textContent = currentVoice.name;
    }

    // Start navigation
    startNavigation() {
        const route = mapManager.currentRoute;
        if (!route) {
            alert('Please select a destination first');
            return;
        }

        // Start navigation
        const started = navigationManager.startNavigation(route);

        if (started) {
            // Update map view for navigation
            mapManager.map.setPitch(45); // Tilt for 3D effect
            mapManager.map.setZoom(16);

            console.log('🚗 Navigation started');
        }
    }

    // End navigation
    endNavigation() {
        const confirmed = confirm('Are you sure you want to end navigation?');
        if (confirmed) {
            navigationManager.stopNavigation();
            mapManager.clearRoute();

            // Reset map view
            mapManager.map.setPitch(0);
            mapManager.map.setZoom(14);

            // Voice announcement
            const currentVoice = voiceManager.getCurrentVoice();
            const cancelMessage = currentVoice.id === 'kiwi-mate'
                ? "No worries mate, catch ya later"
                : "Navigation cancelled";

            voiceManager.speak('start'); // Use generic script

            console.log('🛑 Navigation ended by user');
        }
    }

    // Toggle mute
    toggleMute() {
        const isMuted = voiceManager.toggleMute();
        const muteBtn = document.getElementById('mute-btn');
        muteBtn.textContent = isMuted ? '🔇' : '🔊';

        if (CONFIG.debug) {
            console.log(`🔊 Voice ${isMuted ? 'muted' : 'unmuted'}`);
        }
    }

    // Hide arrival screen
    hideArrivalScreen() {
        document.getElementById('arrival-screen').classList.add('hidden');
    }

    // Start new journey
    startNewJourney() {
        this.hideArrivalScreen();
        mapManager.clearRoute();

        // Reset map
        mapManager.map.setPitch(0);
        mapManager.map.setZoom(14);

        console.log('🆕 Ready for new journey');
    }

    // Rate journey (placeholder)
    rateJourney() {
        alert('Thanks for your feedback! ⭐⭐⭐⭐⭐');
        this.startNewJourney();
    }
}

// ===== APPLICATION STARTUP =====

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

async function startApp() {
    // Create app instance
    const app = new KiwiNavigator();

    // Initialize
    try {
        await app.init();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        alert('Failed to start Kiwi Navigator. Please check your Mapbox token.');
    }

    // Make app available globally for debugging
    if (CONFIG.debug) {
        window.kiwiNavigator = app;
        window.mapManager = mapManager;
        window.voiceManager = voiceManager;
        window.navigationManager = navigationManager;
        console.log('🐛 Debug mode: Objects available in window');
    }
}

// Handle errors
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('🥝 Kiwi Navigator loaded');
