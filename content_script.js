/*
    Let Me Watch it 4 U
    Made with <3 By Michael Gorini
    Mi raccomando studiate comunque brutte capre!
*/

$(document).ready(function () {
    /* Init */
    let w4u_lessonsGalleryUrl, w4u_autopilot, w4u_playbackSpeed;
    let w4u_autopilotCurrentTimer = '';
    let w4u_videoPlaying = false;

    // Crea il toast container
    const toastContainer = $('<div>', {
        id: 'w4u_toasts',
        css: {
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }
    }).appendTo('body');

    function showToast(message, duration = 3000) {
        const catEmojis = ['😺', '😸', '😹', '😻', '😽', '🐱'];
        const randomCat = catEmojis[Math.floor(Math.random() * catEmojis.length)];
        
        const toast = $('<div>', {
            css: {
                backgroundColor: '#ff9100',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
                boxShadow: '0 4px 12px rgba(255, 145, 0, 0.3)',
                opacity: 0,
                transition: 'all 0.3s',
                transform: 'translateX(-100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            },
            html: `<span style="font-size: 20px;">${randomCat}</span><span>${message}</span>`
        }).prependTo(toastContainer);

        // Forza il reflow per attivare la transizione
        toast[0].offsetHeight;

        toast.css({
            opacity: 1,
            transform: 'translateX(0)'
        });

        setTimeout(() => {
            toast.css({
                opacity: 0,
                transform: 'translateX(-100%)'
            });
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Carica le impostazioni
    chrome.storage.local.get(['w4u_lessonsGalleryUrl', 'w4u_autopilot', 'w4u_playbackSpeed'], function(result) {
        w4u_lessonsGalleryUrl = result.w4u_lessonsGalleryUrl;
        w4u_autopilot = result.w4u_autopilot || '0';
        w4u_playbackSpeed = result.w4u_playbackSpeed || '1.5';
        
        initializePage();
    });

    function initializePage() {
        /* Gestione pagine */
        if (window.location.href == 'https://lms.mercatorum.multiversity.click/' || 
            window.location.href == 'https://lms-courses.mercatorum.multiversity.click/') {
            if (w4u_lessonsGalleryUrl && w4u_autopilot == '1') {
                showToast('Ti porto alla lezione...');
                window.location.href = w4u_lessonsGalleryUrl;
            }
        }
        else if (window.location.href.indexOf('lp_controller') > -1) {
            chrome.storage.local.set({ w4u_lessonsGalleryUrl: window.location.href });
            w4u_openFolders();
            showToast('Miao! Ho trovato le videolezioni! Sono pronto a "studiare" con te! 😺', 5000);
            if (w4u_autopilot == '1') {
                setTimeout(() => {
                    showToast('Modalità automatica attiva! Mi metto comodo sulla tastiera... 😸');
                    setTimeout(w4u_findNextLesson, 5000);
                }, 5000);
            }
        }
        else if (window.location.href.indexOf('lp-video_student_view') > -1) {
            if ($('#reCaptchaForm').length) {
                showToast('Ops! C\'è un Captcha! Non ho le zampine per risolverlo... 🐾');
                w4u_solveCaptcha();
            } else {
                if (w4u_autopilot == '1') {
                    showToast('Avvio il video e mi faccio un pisolino...');
                    w4u_findNextVideo();
                    setTimeout(w4u_startCurrentVideo, 500);
                }
            }
        }
    }

    /* Metodi */
    function w4u_openFolders(){
        if ($('.span_folder').length) {
            $('.span_folder').click();
            showToast('Apertura cartelle...');
        }
    }

    function w4u_findNextLesson() {
        let w4u_uncompletedLessons = [];
        $('.progressbar').each(function (idx) {
            if ($(this).width() / $(this).parent().width() * 100 < 75) {
                w4u_uncompletedLessons.push($(this).closest('.contenitore-sezione').find('a').attr('href'));
            }
        });
        
        if (w4u_uncompletedLessons.length > 0) {
            showToast(`Trovate ${w4u_uncompletedLessons.length} lezioni da completare`);
            window.location.href = w4u_uncompletedLessons[0];
        } else {
            showToast('Tutte le lezioni sono state completate!');
        }
    }

    function w4u_findNextVideo(force = false) {
        let w4u_uncompletedVideos = [];
        $('.list-group-item').each(function (idx) {
            if ($(this).text().indexOf('Torna lista') > -1) {
                chrome.storage.local.set({ w4u_lessonsGalleryUrl: $(this).attr('href') });
            } else if (
                $(this).text().indexOf('Test di') == -1 &&
                (
                    $(this).find('.pull-right').find('i').attr('class') != 'icon-check' || 
                    $(this).find('.pull-right').find('i').css('color') == 'rgb(255, 0, 0)'
                )
            ) {
                w4u_uncompletedVideos.push($(this).attr('href'));
            }
        });

        if (!force && window.location.href.indexOf(w4u_uncompletedVideos[0]) > -1) {
            showToast('Video corrente da completare');
        } else {
            if (w4u_uncompletedVideos.length > 0) {
                showToast(`Trovati ${w4u_uncompletedVideos.length} video da completare`);
                window.location.href = w4u_uncompletedVideos[0];
            } else {
                showToast('Lezione completata, passaggio alla prossima');
                window.location.href = w4u_lessonsGalleryUrl;
            }
        }
    }

    function w4u_startCurrentVideo() {
        const video = document.getElementById("my-video_html5_api");
        if (video) {
            document.getElementById("control-play").click();
            video.playbackRate = parseFloat(w4u_playbackSpeed);
            w4u_videoPlaying = true;
            showToast(`Miao! Video avviato a ${w4u_playbackSpeed}x... Mi piace correre! 🏃‍♂️`);
            w4u_autopilotCurrentTimer = $('#currenttime_box').text();
            setTimeout(w4u_checkAutopilotVideo, 2000);
            return true;
        }
        return false;
    }

    function w4u_stopCurrentVideo() {
        const video = document.getElementById("my-video_html5_api");
        if (video) {
            document.getElementById("control-pause").click();
            w4u_videoPlaying = false;
            showToast('Pausa! Mi faccio un pisolino... 😴');
            return true;
        }
        return false;
    }

    function w4u_checkAutopilotVideo(){
        if(w4u_autopilotCurrentTimer == $('#currenttime_box').text()){
            showToast('Miao! Il video si è bloccato! Ricarica la pagina che mi sono addormentato...');
            chrome.runtime.sendMessage('', {
                type: 'notification',
                options: {
                    title: 'Miao! Video Bloccato! 😿',
                    message: 'Ricarica la pagina che mi sono addormentato...',
                    iconUrl: 'icon.png',
                    type: 'basic'
                }
            });
        }
    }

    function w4u_solveCaptcha() {
        chrome.runtime.sendMessage('', {
            type: 'notification',
            options: {
                title: 'Captcha!',
                message: 'Risolvi il captcha per continuare',
                iconUrl: 'icon.png',
                type: 'basic'
            }
        });
    }

    /* Gestione messaggi dal popup */
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch(request.action) {
            case 'updatePlaybackSpeed':
                w4u_playbackSpeed = request.speed;
                const video = document.getElementById("my-video_html5_api");
                if (video) {
                    video.playbackRate = parseFloat(request.speed);
                    showToast(`Velocità impostata a ${request.speed}x`);
                }
                break;
            
            case 'toggleAutopilot':
                w4u_autopilot = request.enabled ? '1' : '0';
                if (request.enabled) {
                    showToast('Modalità automatica attivata');
                    initializePage();
                } else {
                    showToast('Modalità automatica disattivata');
                }
                break;
            
            case 'toggleVideo':
                let success = false;
                if (w4u_videoPlaying) {
                    success = w4u_stopCurrentVideo();
                } else {
                    success = w4u_startCurrentVideo();
                }
                sendResponse({
                    success: success,
                    playing: w4u_videoPlaying
                });
                break;

            case 'getVideoState':
                const videoExists = document.getElementById("my-video_html5_api") !== null;
                sendResponse({
                    exists: videoExists,
                    playing: w4u_videoPlaying
                });
                break;
        }
        return true; // Necessario per sendResponse asincrono
    });
});
