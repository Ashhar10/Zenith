const iframe = document.getElementById('playcanvas-iframe');

// Elements
const unitDialogue = document.getElementById('unit-dialogue');
const unitTitle = document.getElementById('unit-title');
const unitSqft = document.getElementById('unit-sqft');
const unitRooms = document.getElementById('unit-rooms');

// Last tag seen to avoid flickering/constant updates
let lastConfigKey = null;
let lastTag = null;
let clearTimer = null;

// Mouse Tracking
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateDialoguePosition();
});

function updateDialoguePosition() {
    if (unitDialogue && unitDialogue.classList.contains('active')) {
        const offsetX = 25;
        const offsetY = 25;

        let x = mouseX + offsetX;
        let y = mouseY + offsetY;

        const cardWidth = 320;
        const cardHeight = 280; // Estimated height for new content

        if (x + cardWidth > window.innerWidth) x = mouseX - cardWidth - offsetX;
        if (y + cardHeight > window.innerHeight) y = mouseY - cardHeight - offsetY;

        unitDialogue.style.left = `${x}px`;
        unitDialogue.style.top = `${y}px`;
    }
}

function sendMessage(action) {
    if (!iframe || !iframe.contentWindow) return;
    const message = action + ':';
    iframe.contentWindow.postMessage(message, '*');
}

// Unit Configuration Mapping
const UNIT_TYPES = {
    '3BED': {
        title: '3 Bed Luxury Suite',
        rooms: [
            { name: '3 Bedrooms', icon: 'fa-bed' },
            { name: 'Kitchen', icon: 'fa-utensils' },
            { name: 'Lounge', icon: 'fa-couch' },
            { name: 'Dining', icon: 'fa-chair' },
            { name: 'Balcony', icon: 'fa-sun' }
        ],
        area: [1850, 2200]
    },
    '2BED': {
        title: '2 Bed Premium Unit',
        rooms: [
            { name: '2 Bedrooms', icon: 'fa-bed' },
            { name: 'Kitchen', icon: 'fa-utensils' },
            { name: '2 Bathrooms', icon: 'fa-bath' }
        ],
        area: [1250, 1500]
    }
};

function getRandomSqFt(range) {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

// Handle messages FROM PlayCanvas
window.addEventListener('message', function (event) {
    let tag = event.data;
    if (typeof tag !== 'string') return;
    tag = tag.trim();

    console.log(`🔍 Received Message: "${tag}"`);

    // 1. Detection Logic
    let unitType = null;

    // Pattern A: Specific Floor Names (e.g., FloorMid3, FloorMid7)
    const floorMatch = tag.match(/FloorMid(\d+)/i);
    if (floorMatch) {
        const num = parseInt(floorMatch[1]);
        const oddFloors = [1, 3, 5, 7, 9, 11, 13];
        unitType = oddFloors.includes(num) ? '3BED' : '2BED';
        console.log(`⚖️ Comparing: Floor ${num} -> [${oddFloors.includes(num) ? 'Odd' : 'Even'}]`);
    }
    // Pattern B: Legacy Tags (Fallbacks)
    else if (tag === 'mid_floor' || tag === 'mid-floor') {
        unitType = '3BED';
        console.log(`⚖️ Comparing: Legacy tag detected -> 3BED`);
    }
    else if (tag === 'mid-floor-2' || tag === 'mid_floor-2' || tag === 'mid_floor_2') {
        unitType = '2BED';
        console.log(`⚖️ Comparing: Legacy tag detected -> 2BED`);
    }

    // 2. Enable or Disable
    if (unitType) {
        console.log(`✅ Result: Enabling ${unitType} dialogue`);
        updateContent(unitType);
        showDialogue();

        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(() => hideAllDialogues(), 4000);
    } else {
        // Tag doesn't match any unit trigger
        if (tag !== "" && tag !== "none" && tag !== lastTag) {
            console.log(`🚫 Result: No match found for "${tag}". Disabling.`);
            hideAllDialogues();
        }
    }

    lastTag = tag;
});

function updateContent(configKey) {
    // CRITICAL: Avoid constant DOM updates if we are hovering the same type
    if (configKey === lastConfigKey) return;

    const config = UNIT_TYPES[configKey];
    if (!config) return;

    unitTitle.textContent = config.title;
    unitSqft.textContent = getRandomSqFt(config.area);

    // Clear and rebuild room tags with icons
    unitRooms.innerHTML = '';
    config.rooms.forEach(room => {
        const span = document.createElement('span');
        span.className = 'room-tag';
        span.innerHTML = `<i class="fa-solid ${room.icon}"></i> ${room.name}`;
        unitRooms.appendChild(span);
    });

    lastConfigKey = configKey;
}

function showDialogue() {
    unitDialogue.classList.add('active');
    updateDialoguePosition();
}

function hideAllDialogues() {
    unitDialogue.classList.remove('active');
    lastConfigKey = null; // Important: Clear this so it can be re-triggered
}

// Close on interaction
window.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.dialogue-card') && !e.target.closest('.side-slider')) {
        hideAllDialogues();
    }
});

console.log('Zenith Configurator: Ready.');
