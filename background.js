
function playSound() {
    let url = chrome.runtime.getURL('audio.html');
    url += '?volume=0.5&src=sound.mp3&length=1000';

    chrome.windows.create({
        type: 'popup',
        focused: true,
        top: 1,
        left: 1,
        height: 1,
        width: 1,
        url,
    })

}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        playSound();
        chrome.notifications.create('', request.options);
    });

