document.addEventListener('DOMContentLoaded', function() {
    // Elementi UI
    const toggleAutopilotBtn = document.getElementById('toggleAutopilot');
    const toggleVideoBtn = document.getElementById('toggleVideo');
    const playbackSpeedInput = document.getElementById('playbackSpeed');
    const saveSpeedBtn = document.getElementById('saveSpeed');
    const statusDiv = document.getElementById('status');

    function updateVideoButtonState() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'getVideoState'
            }, function(response) {
                if (response) {
                    toggleVideoBtn.disabled = !response.exists;
                    if (response.exists) {
                        toggleVideoBtn.textContent = response.playing ? 'Pausa Video' : 'Avvia Video';
                    } else {
                        toggleVideoBtn.textContent = 'Play/Stop Video';
                    }
                }
            });
        });
    }

    // Carica le impostazioni salvate
    function loadSettings() {
        chrome.storage.local.get(['w4u_autopilot', 'w4u_playbackSpeed'], function(result) {
            const autopilot = result.w4u_autopilot || '0';
            const speed = result.w4u_playbackSpeed || '1';

            toggleAutopilotBtn.textContent = autopilot === '1' ? 'Disattiva Micio Autopilot' : 'Attiva Micio Autopilot';
            playbackSpeedInput.value = speed;
        });

        updateVideoButtonState();
    }

    // Mostra toast
    function showToast(message, duration = 3000) {
        statusDiv.textContent = message;
        statusDiv.classList.add('show');
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, duration);
    }

    // Toggle Autopilot
    toggleAutopilotBtn.addEventListener('click', function() {
        chrome.storage.local.get(['w4u_autopilot'], function(result) {
            const currentValue = result.w4u_autopilot || '0';
            const newValue = currentValue === '1' ? '0' : '1';
            
            chrome.storage.local.set({ w4u_autopilot: newValue }, function() {
                toggleAutopilotBtn.textContent = newValue === '1' ? 'Disattiva Micio Autopilot' : 'Attiva Micio Autopilot';
                
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleAutopilot',
                        enabled: newValue === '1'
                    });
                });
            });
        });
    });

    // Toggle Video Play/Stop
    toggleVideoBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleVideo'
            }, function(response) {
                if (response && response.success) {
                    toggleVideoBtn.textContent = response.playing ? 'Pausa Video' : 'Avvia Video';
                }
            });
        });
    });

    // Salva velocità
    saveSpeedBtn.addEventListener('click', function() {
        const newSpeed = playbackSpeedInput.value;
        
        if (newSpeed >= 0.1 && newSpeed <= 16) {
            chrome.storage.local.set({ w4u_playbackSpeed: newSpeed }, function() {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updatePlaybackSpeed',
                        speed: newSpeed
                    });
                });
            });
        } else {
            showToast('La velocità deve essere compresa tra 0.1 e 16');
        }
    });

    // Carica le impostazioni all'apertura
    loadSettings();

    // Aggiorna lo stato del pulsante ogni secondo
    setInterval(updateVideoButtonState, 1000);
});

