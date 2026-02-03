let activeButton = null;
const iframe = document.getElementById('playcanvas-iframe');

function sendMessage(action) {
    if (!iframe || !iframe.contentWindow) {
        console.error('iframe not ready');
        return;
    }

    // Format the message as expected by the PlayCanvas script
    const message = action + ':';
    
    // Send the message to the iframe
    iframe.contentWindow.postMessage(message, '*');
    
    console.log('Sent message:', message);

    // Visual feedback - highlight active button
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const clickedButton = event.target.closest('.control-btn');
    if (clickedButton) {
        clickedButton.classList.add('active');
        activeButton = clickedButton;
        
        // Remove active state after 2 seconds
        setTimeout(() => {
            clickedButton.classList.remove('active');
        }, 2000);
    }
}

// Wait for iframe to load before enabling interaction
iframe.addEventListener('load', function() {
    console.log('PlayCanvas iframe loaded successfully');
});

// Listen for messages from the iframe (optional)
window.addEventListener('message', function(event) {
    console.log('Received message from iframe:', event.data);
});
