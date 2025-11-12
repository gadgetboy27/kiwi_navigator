// Voice Personality System for Kiwi Navigator

// ===== VOICE CHARACTER DEFINITIONS =====

const VOICE_CHARACTERS = {
    'kiwi-mate': {
        id: 'kiwi-mate',
        name: 'Kiwi Mate',
        emoji: '😎',
        tagline: '"Sweet as, mate!"',
        description: 'Friendly, casual Kiwi who keeps it real',
        locked: false,

        // Voice Scripts
        scripts: {
            // Starting navigation
            start: [
                "Sweet as, let's get going mate!",
                "Right-o, off we go!",
                "Choice! Let's hit the road",
                "She'll be right, let's do this"
            ],

            // Turn instructions
            turnLeft: "Turn left in {distance}",
            turnRight: "Turn right in {distance}",
            goStraight: "Keep going straight, mate",

            // Close to turn
            turnSoon: "Coming up - turn {direction} in {distance}",
            turnNow: "Turn {direction} now, mate",

            // After successful turn
            turnComplete: [
                "Choice! Now {nextInstruction}",
                "Sweet as! Keep going {nextInstruction}",
                "Good stuff mate, now {nextInstruction}"
            ],

            // Off route
            offRoute: [
                "Ah bugger, we're off track mate. Recalculating...",
                "No worries, let me sort out a new route",
                "Oops, missed that turn. I'll get us back on track"
            ],

            // Progress updates
            progress: [
                "{distance} to go, you're doing great mate",
                "Still cruising, {distance} left",
                "Nearly there - {distance} remaining"
            ],

            // Arrival
            arrival: [
                "You've arrived mate! Easy as!",
                "Sweet, we're here! That was choice",
                "Destination reached. She'll be right!",
                "Here we are mate, safe and sound"
            ],

            // Traffic/delays
            traffic: "Bit of traffic ahead mate, hang tight",

            // Parking tips
            parkingTip: "Heads up, parking's usually tight around here mate",

            // Encouragement
            encouragement: [
                "You're smashing it mate!",
                "Driving like a true Kiwi!",
                "Choice driving mate!"
            ]
        }
    },

    'sarcastic': {
        id: 'sarcastic',
        name: 'Sarcastic Sidekick',
        emoji: '😏',
        tagline: '"Try not to get lost..."',
        description: 'Cheeky humor with a side of sass',
        locked: false,

        scripts: {
            start: [
                "Alright genius, let's see if you can follow directions",
                "Try not to get lost this time, yeah?",
                "Oh good, another adventure in questionable driving",
                "Let's do this before I change my mind"
            ],

            turnLeft: "Turn left in {distance} - I'll try to make this simple",
            turnRight: "Turn right in {distance} - yes, right, the OTHER left",
            goStraight: "Just go straight. Revolutionary concept, I know",

            turnSoon: "Okay, so turn {direction} in {distance}. Don't overthink it",
            turnNow: "Turn {direction} NOW - go go go!",

            turnComplete: [
                "Wow, you actually made that turn. Impressive",
                "Look at you, following directions like a champ",
                "Not bad. Now {nextInstruction}"
            ],

            offRoute: [
                "Oh fantastic, we're lost. Recalculating...",
                "Well THAT was creative. Getting us back on track...",
                "Did you miss the giant turn arrow? It's cool, recalculating",
                "Taking the scenic route I see. Let me fix this"
            ],

            progress: [
                "{distance} to go - IF you don't get lost again",
                "Only {distance} left. You might actually make it",
                "We're {distance} away from me leaving you alone"
            ],

            arrival: [
                "We're here. Somehow you didn't get lost. Miracle",
                "You've arrived. I'm honestly shocked",
                "Destination reached. Against all odds",
                "We made it! And you only ignored me twice"
            ],

            traffic: "Traffic ahead. Perfect time to contemplate your life choices",
            parkingTip: "Good luck finding parking. You're gonna need it",

            encouragement: [
                "That was almost competent!",
                "You're slightly better than I expected",
                "I've seen worse driving... barely"
            ]
        }
    },

    'zen': {
        id: 'zen',
        name: 'Zen Guide',
        emoji: '🧘',
        tagline: '"Find your way... peacefully"',
        description: 'Calm, mindful navigation guru',
        locked: false, // Set to true to make it premium

        scripts: {
            start: [
                "Let us begin this journey together, peacefully",
                "Breathe in... and let's flow toward our destination",
                "The path reveals itself. Let us start",
                "With mindful intent, we begin our journey"
            ],

            turnLeft: "In {distance}, gently guide left",
            turnRight: "In {distance}, smoothly transition right",
            goStraight: "Continue forward, stay present",

            turnSoon: "Prepare yourself. In {distance}, turn {direction}",
            turnNow: "Now, with grace, turn {direction}",

            turnComplete: [
                "Well done. Now {nextInstruction}",
                "Excellent. Continue to {nextInstruction}",
                "You flow with the journey. Now {nextInstruction}"
            ],

            offRoute: [
                "The path has changed. Let us recalibrate mindfully",
                "No worries, all paths lead somewhere. Recalculating",
                "Embrace the detour. Finding a new way"
            ],

            progress: [
                "{distance} remaining. Be patient with yourself",
                "You've come far. {distance} left on this journey",
                "Breathe. Only {distance} until we arrive"
            ],

            arrival: [
                "You have arrived. Well done on this journey",
                "Our destination is reached. You did wonderfully",
                "The journey concludes here. Find peace in your arrival",
                "You've arrived mindfully and safely"
            ],

            traffic: "Traffic ahead. A moment to breathe and be present",
            parkingTip: "Parking may be challenging. Patience will serve you",

            encouragement: [
                "You're doing beautifully",
                "Your focus is admirable",
                "Stay present, you're doing great"
            ]
        }
    },

    'professional': {
        id: 'professional',
        name: 'Professional Navigator',
        emoji: '💼',
        tagline: '"Efficient. Reliable. On time."',
        description: 'Business-focused, perfect for agents',
        locked: false,

        scripts: {
            start: [
                "Navigation started. Route optimized",
                "Beginning navigation to your destination",
                "Let's proceed to the destination efficiently",
                "Navigation active. ETA calculated"
            ],

            turnLeft: "Turn left in {distance}",
            turnRight: "Turn right in {distance}",
            goStraight: "Continue straight ahead",

            turnSoon: "Prepare to turn {direction} in {distance}",
            turnNow: "Turn {direction}",

            turnComplete: [
                "Turn complete. {nextInstruction}",
                "Proceed to {nextInstruction}",
                "Continue {nextInstruction}"
            ],

            offRoute: [
                "Route deviation detected. Recalculating",
                "You've left the planned route. Finding alternative",
                "Recalculating route to destination"
            ],

            progress: [
                "{distance} remaining to destination",
                "Current progress: {distance} to go",
                "Distance to destination: {distance}"
            ],

            arrival: [
                "You have arrived at your destination",
                "Destination reached",
                "You've arrived. Navigation complete",
                "Arrival confirmed at destination"
            ],

            traffic: "Traffic conditions detected ahead",
            parkingTip: "Note: Limited parking availability in this area",

            encouragement: [
                "On schedule",
                "Excellent time management",
                "Efficient routing"
            ]
        }
    }
};

// ===== VOICE MANAGER CLASS =====

class VoiceManager {
    constructor() {
        this.currentVoice = 'kiwi-mate';
        this.isMuted = false;
        this.synthesis = window.speechSynthesis;
        this.voices = [];

        // Wait for voices to load
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => {
                this.voices = this.synthesis.getVoices();
            };
        }

        // Load saved preference
        const savedVoice = localStorage.getItem('kiwiNavigatorVoice');
        if (savedVoice && VOICE_CHARACTERS[savedVoice]) {
            this.currentVoice = savedVoice;
        }
    }

    // Select a voice character
    selectVoice(voiceId) {
        if (VOICE_CHARACTERS[voiceId] && !VOICE_CHARACTERS[voiceId].locked) {
            this.currentVoice = voiceId;
            localStorage.setItem('kiwiNavigatorVoice', voiceId);
            return true;
        }
        return false;
    }

    // Get current voice character
    getCurrentVoice() {
        return VOICE_CHARACTERS[this.currentVoice];
    }

    // Get a random script from an array
    getRandomScript(scripts) {
        if (Array.isArray(scripts)) {
            return scripts[Math.floor(Math.random() * scripts.length)];
        }
        return scripts;
    }

    // Format script with variables
    formatScript(script, variables = {}) {
        let formatted = script;
        for (const [key, value] of Object.entries(variables)) {
            formatted = formatted.replace(`{${key}}`, value);
        }
        return formatted;
    }

    // Speak a script
    speak(scriptKey, variables = {}) {
        if (this.isMuted) return;

        const character = this.getCurrentVoice();
        let script = character.scripts[scriptKey];

        if (!script) {
            console.warn(`Script "${scriptKey}" not found for ${character.name}`);
            return;
        }

        // Get random variation if array
        script = this.getRandomScript(script);

        // Format with variables
        script = this.formatScript(script, variables);

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.rate = CONFIG.voice.rate;
        utterance.pitch = CONFIG.voice.pitch;
        utterance.volume = CONFIG.voice.volume;

        // Try to use preferred voice for character
        const preferredVoice = CONFIG.voice.preferredVoices[this.currentVoice];
        if (preferredVoice && this.voices.length > 0) {
            const voice = this.voices.find(v => v.name.includes(preferredVoice));
            if (voice) utterance.voice = voice;
        }

        // Speak it
        this.synthesis.speak(utterance);

        // Log for debugging
        if (CONFIG.debug) {
            console.log(`🗣️ ${character.name}: "${script}"`);
        }

        return script;
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.synthesis.cancel(); // Stop any current speech
        }
        return this.isMuted;
    }

    // Preview a voice character
    preview(voiceId) {
        const originalVoice = this.currentVoice;
        const originalMute = this.isMuted;

        this.currentVoice = voiceId;
        this.isMuted = false;

        this.speak('start');

        // Restore after preview
        setTimeout(() => {
            this.currentVoice = originalVoice;
            this.isMuted = originalMute;
        }, 100);
    }
}

// ===== INITIALIZE VOICE MANAGER =====
const voiceManager = new VoiceManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceManager, VOICE_CHARACTERS, voiceManager };
}
