// Turn-by-turn Navigation Logic for Kiwi Navigator

class NavigationManager {
    constructor() {
        this.isNavigating = false;
        this.currentRoute = null;
        this.currentStepIndex = 0;
        this.remainingDistance = 0;
        this.remainingDuration = 0;
        this.positionInterval = null;
        this.lastAnnouncementDistance = 0;
    }

    // Start navigation
    startNavigation(route) {
        if (!route || !mapManager.currentLocation) {
            console.error('Cannot start navigation: missing route or location');
            return false;
        }

        this.currentRoute = route;
        this.currentStepIndex = 0;
        this.isNavigating = true;
        this.remainingDistance = route.distance;
        this.remainingDuration = route.duration;

        // Update UI
        this.showActiveNavigationPanel();

        // Start position tracking
        this.startPositionTracking();

        // Initial voice announcement
        voiceManager.speak('start');

        // Announce first instruction after a delay
        setTimeout(() => {
            this.announceCurrentStep();
        }, 2000);

        console.log('🧭 Navigation started');
        return true;
    }

    // Start tracking position during navigation
    startPositionTracking() {
        this.positionInterval = setInterval(() => {
            this.updateNavigationState();
        }, CONFIG.navigation.positionUpdateInterval);
    }

    // Update navigation state based on current position
    updateNavigationState() {
        if (!this.isNavigating || !this.currentRoute) return;

        const currentLocation = mapManager.currentLocation;
        if (!currentLocation) return;

        const currentStep = this.getCurrentStep();
        if (!currentStep) {
            // No more steps - we've arrived!
            this.handleArrival();
            return;
        }

        // Calculate distance to next maneuver
        const distanceToStep = this.calculateDistanceToStep(currentLocation, currentStep);

        // Update UI
        this.updateNavigationUI(distanceToStep, currentStep);

        // Check if we should announce the turn
        this.checkTurnAnnouncement(distanceToStep, currentStep);

        // Check if we've completed this step
        if (distanceToStep < 20) { // Within 20m of maneuver point
            this.advanceToNextStep();
        }

        // Check if off route
        this.checkOffRoute(currentLocation);
    }

    // Get current navigation step
    getCurrentStep() {
        if (this.currentRoute && this.currentRoute.legs && this.currentRoute.legs[0]) {
            const steps = this.currentRoute.legs[0].steps;
            if (this.currentStepIndex < steps.length) {
                return steps[this.currentStepIndex];
            }
        }
        return null;
    }

    // Calculate distance to next step (Haversine formula)
    calculateDistanceToStep(from, step) {
        const stepCoords = step.maneuver.location;
        const R = 6371e3; // Earth radius in meters
        const φ1 = from.lat * Math.PI / 180;
        const φ2 = stepCoords[1] * Math.PI / 180;
        const Δφ = (stepCoords[1] - from.lat) * Math.PI / 180;
        const Δλ = (stepCoords[0] - from.lng) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    }

    // Update navigation UI
    updateNavigationUI(distanceToStep, currentStep) {
        // Format distance
        let distanceText;
        if (distanceToStep > 1000) {
            distanceText = `${(distanceToStep / 1000).toFixed(1)} km`;
        } else {
            distanceText = `${Math.round(distanceToStep)} m`;
        }

        // Update distance display
        document.getElementById('distance-to-turn').textContent = distanceText;

        // Update instruction text
        const instruction = this.formatInstruction(currentStep);
        document.getElementById('instruction-text').textContent = instruction;

        // Update turn arrow
        const arrow = this.getTurnArrow(currentStep);
        document.getElementById('turn-arrow').textContent = arrow;

        // Update remaining distance and time
        document.getElementById('remaining-distance').textContent = `${(this.remainingDistance / 1000).toFixed(1)} km`;
        document.getElementById('remaining-time').textContent = `${Math.round(this.remainingDuration / 60)} min`;
    }

    // Format instruction text
    formatInstruction(step) {
        const modifier = step.maneuver.modifier || '';
        const type = step.maneuver.type;
        const name = step.name || 'the road';

        // Map maneuver types to readable instructions
        const instructions = {
            'turn': `Turn ${modifier} onto ${name}`,
            'new name': `Continue onto ${name}`,
            'depart': `Head ${modifier} on ${name}`,
            'arrive': `Arrive at destination`,
            'merge': `Merge ${modifier}`,
            'on ramp': `Take the ramp ${modifier}`,
            'off ramp': `Take the exit ${modifier}`,
            'fork': `Keep ${modifier} at the fork`,
            'roundabout': `Take exit at roundabout onto ${name}`,
            'rotary': `Take exit at roundabout onto ${name}`,
            'continue': `Continue on ${name}`
        };

        return instructions[type] || step.maneuver.instruction || `Continue on ${name}`;
    }

    // Get turn arrow emoji
    getTurnArrow(step) {
        const modifier = step.maneuver.modifier || '';
        const type = step.maneuver.type;

        const arrows = {
            'straight': '⬆️',
            'slight right': '↗️',
            'right': '➡️',
            'sharp right': '⤵️',
            'slight left': '↖️',
            'left': '⬅️',
            'sharp left': '↩️',
            'uturn': '↩️'
        };

        return arrows[modifier] || arrows[type] || '⬆️';
    }

    // Check if we should announce the turn
    checkTurnAnnouncement(distanceToStep, currentStep) {
        const announceDistance = CONFIG.navigation.turnAnnouncementDistance;

        // Announce at specific distance
        if (distanceToStep <= announceDistance && distanceToStep > announceDistance - 50) {
            if (this.lastAnnouncementDistance !== announceDistance) {
                this.announceUpcomingTurn(distanceToStep, currentStep);
                this.lastAnnouncementDistance = announceDistance;
            }
        }

        // Announce "turn now" at 30m
        if (distanceToStep <= 30 && this.lastAnnouncementDistance !== 30) {
            this.announceTurnNow(currentStep);
            this.lastAnnouncementDistance = 30;
        }
    }

    // Announce current step
    announceCurrentStep() {
        const step = this.getCurrentStep();
        if (!step) return;

        const instruction = this.formatInstruction(step);
        const distanceText = this.formatDistance(step.distance);

        voiceManager.speak('goStraight', {
            instruction: instruction,
            distance: distanceText
        });

        // Show voice message in UI
        this.showVoiceMessage(voiceManager.getCurrentVoice().scripts.goStraight);
    }

    // Announce upcoming turn
    announceUpcomingTurn(distance, step) {
        const direction = step.maneuver.modifier || 'ahead';
        const distanceText = this.formatDistance(distance);

        voiceManager.speak('turnSoon', {
            direction: direction,
            distance: distanceText
        });

        this.showVoiceMessage(`Turn ${direction} in ${distanceText}`);
    }

    // Announce turn now
    announceTurnNow(step) {
        const direction = step.maneuver.modifier || 'ahead';

        voiceManager.speak('turnNow', {
            direction: direction
        });

        this.showVoiceMessage(`Turn ${direction} now!`);
    }

    // Advance to next step
    advanceToNextStep() {
        this.currentStepIndex++;
        this.lastAnnouncementDistance = 0;

        const nextStep = this.getCurrentStep();
        if (nextStep) {
            // Announce completion and next instruction
            const nextInstruction = this.formatInstruction(nextStep);
            voiceManager.speak('turnComplete', {
                nextInstruction: nextInstruction
            });

            console.log('✅ Step completed, moving to next');
        } else {
            // No more steps - arrival
            this.handleArrival();
        }
    }

    // Check if user is off route
    checkOffRoute(currentLocation) {
        // TODO: Implement proper off-route detection
        // For now, just a placeholder
    }

    // Handle arrival at destination
    handleArrival() {
        console.log('🎉 Arrived at destination!');

        // Stop navigation
        this.stopNavigation();

        // Announce arrival
        voiceManager.speak('arrival');

        // Show arrival screen
        this.showArrivalScreen();
    }

    // Show arrival screen
    showArrivalScreen() {
        const arrivalScreen = document.getElementById('arrival-screen');
        const arrivalAddress = document.getElementById('arrival-address');

        arrivalAddress.textContent = mapManager.destination.name;
        arrivalScreen.classList.remove('hidden');
    }

    // Stop navigation
    stopNavigation() {
        this.isNavigating = false;

        if (this.positionInterval) {
            clearInterval(this.positionInterval);
            this.positionInterval = null;
        }

        // Hide active navigation panel
        document.getElementById('active-nav-panel').classList.add('hidden');

        console.log('🛑 Navigation stopped');
    }

    // Show active navigation panel
    showActiveNavigationPanel() {
        document.getElementById('nav-panel').classList.add('hidden');
        document.getElementById('active-nav-panel').classList.remove('hidden');

        // Update voice avatar
        const currentVoice = voiceManager.getCurrentVoice();
        document.getElementById('nav-voice-avatar').textContent = currentVoice.emoji;
    }

    // Show voice message in UI
    showVoiceMessage(message) {
        const voiceMessageEl = document.getElementById('voice-message');
        voiceMessageEl.textContent = message;

        // Animate
        voiceMessageEl.style.opacity = '0';
        setTimeout(() => {
            voiceMessageEl.style.transition = 'opacity 0.3s';
            voiceMessageEl.style.opacity = '1';
        }, 50);
    }

    // Format distance for voice
    formatDistance(meters) {
        if (meters > 1000) {
            return `${(meters / 1000).toFixed(1)} kilometers`;
        } else if (meters > 100) {
            return `${Math.round(meters / 50) * 50} meters`;
        } else {
            return `${Math.round(meters)} meters`;
        }
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavigationManager, navigationManager };
}
