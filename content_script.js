/*
    Let Me Watch it 4 U
    Made with <3 By Michael Gorini
    Mi raccomando studiate comunque brutte capre!
*/

$(document).ready(function () {

    /* Init */

    var w4u_lessonsGalleryUrl = window.localStorage.getItem('w4u_lessonsGalleryUrl');
    var w4u_autopilot = window.localStorage.getItem('w4u_autopilot');
    if (w4u_autopilot == '') w4u_autopilot = 0;

    console.log('W4U Caricata! =^..^=')
    console.log('Corso selezionato: ', w4u_lessonsGalleryUrl);
    console.log('Autopilot: ', w4u_autopilot);

    /* UI */

    function w4u_generateUiHtml(content, autopilot = true) {

        let autopilotButton = '';

        if (autopilot) {
            if (w4u_autopilot != 1) {
                autopilotButton = "<button type='button' id='w4u_startAutopilot' style='margin-right: 10px;'>Abilita Modalità Automatica</button>";
            } else {
                autopilotButton = "<button type='button' id='w4u_stopAutopilot' style='margin-right: 10px;'>Disabilita Modalità Automatica</button>";
            }
        }

        return " \
        <div style='margin:20px 0 20px 0;'>\
            <div class='titolo-sezione'>Let Me Watch it 4 U =^..^=</div>\
            <div class='contenitore-sezione'>"
            + autopilotButton + content +
            "</div>\
        </div>\
        ";

    }

    if (window.location.href == 'https://lms.mercatorum.multiversity.click/') {
        console.log('Home');
        if (w4u_lessonsGalleryUrl) {
            setTimeout(function () {
                $('.main-page-content').prepend(w4u_generateUiHtml("<a href='"+w4u_lessonsGalleryUrl+"'><button type='button' class='btn-mercatorum mr-auto mt-5 lippo-xxs:text-sm' id='w4u_resumeLessons'>Riprendi a \"\"Studiare\"\"</button></a>", false));
            }, 2500);
        } else {
            setTimeout(function () {
                $('.main-page-content').prepend(w4u_generateUiHtml("Ciao! Per iniziare vai in un elenco di videolezioni, mi ricorderò automaticamente tutto quello che hai da vedere! <br/>Usami quanto vuoi ma ricorda anche di studiare, capra che non sei altro.", false));
            }, 2500);
        }
    }
    else if (window.location.href == 'https://lms-courses.mercatorum.multiversity.click/') {
        console.log('Home Secondaria');
        if (w4u_lessonsGalleryUrl) {
            $('#content').prepend(w4u_generateUiHtml("<button type='button' id='w4u_resumeLessons'>Riprendi a \"\"Studiare\"\"</button>", false));
        } else {
            $('#content').prepend(w4u_generateUiHtml("Ciao! Per iniziare vai in un elenco di videolezioni, mi ricorderò automaticamente tutto quello che hai da vedere! <br/>Usami quanto vuoi ma ricorda anche di studiare, capra che non sei altro.", false));
        }
    }
    else if (window.location.href.indexOf('lp_controller') > -1) {
        console.log('Elenco lezioni');
        window.localStorage.setItem('w4u_lessonsGalleryUrl', window.location.href);
        $('#GalleryContainer').prepend(w4u_generateUiHtml("<button type='button' id='w4u_openNextLesson'>Apri Prossima Lezione</button>"));
        if (w4u_autopilot == 1) {
            setTimeout(w4u_findNextLesson, 3000);
            $('#GalleryContainer').prepend('<h1 style="color: red;">Modalità Automatica Abilitata: inizio tra 3 secondi...</h1>')
        }
    }
    else
        if (window.location.href.indexOf('lp-video_student_view') > -1) {

            if ($('#reCaptchaForm').length) {
                console.log('Captcha');
                w4u_solveCaptcha();
            } else {
                console.log('Singola lezione');
                $('#list-lessons-tool').append(w4u_generateUiHtml("<button type='button' id='w4u_startNextVideo'>Avvia Prossimo Video</button>"));

                if (w4u_autopilot == 1) {
                    w4u_findNextVideo();
                    w4u_startCurrentVideo();
                }
            }

        }

    /* Metodi */

    $('#w4u_resumeLessons').on('click', w4u_resumeLessons);
    function w4u_resumeLessons() {
        window.location.href = w4u_lessonsGalleryUrl;
    }

    $('#w4u_startAutopilot').on('click', w4u_startAutopilot);
    function w4u_startAutopilot() {
        window.localStorage.setItem('w4u_autopilot', 1);
        w4u_autopilot = window.localStorage.getItem('w4u_autopilot')
        location.reload();
    }

    $('#w4u_stopAutopilot').on('click', w4u_stopAutopilot);
    function w4u_stopAutopilot() {
        window.localStorage.setItem('w4u_autopilot', 0);
        w4u_autopilot = window.localStorage.getItem('w4u_autopilot');
        location.reload();
    }

    $('#w4u_openNextLesson').on('click', w4u_findNextLesson);
    function w4u_findNextLesson() {
        console.log('Cerco lezioni');
        let w4u_uncompletedLessons = [];
        $('.progressbar').each(function (idx) {
            console.log($(this).width() / $(this).parent().width() * 100);
            if ($(this).width() / $(this).parent().width() * 100 < 80) {
                w4u_uncompletedLessons.push($(this).closest('.contenitore-sezione').find('a').attr('href'));
            }
        });
        console.log('Lezioni mancanti: ', w4u_uncompletedLessons.length);
        console.log('Prossima lezione: ', w4u_uncompletedLessons[0])
        window.location.href = w4u_uncompletedLessons[0];
    }

    $('#w4u_startNextVideo').on('click', w4u_findNextVideo);
    function w4u_findNextVideo() {
        console.log('Cerco video');

        let w4u_uncompletedVideos = [];
        $('.list-group-item').each(function (idx) {

            if ($(this).text().indexOf('Torna lista') > -1) {
                window.localStorage.setItem('w4u_lessonsGalleryUrl', $(this).attr('href'));
                w4u_lessonsGalleryUrl = window.localStorage.getItem('w4u_lessonsGalleryUrl');
            } else if (
                $(this).text().indexOf('Test di') == -1 &&
                (
                    $(this).find('.pull-right').find('i').attr('class') != 'icon-check' || $(this).find('.pull-right').find('i').css('color') == 'rgb(255, 0, 0)'
                )
            ) {
                w4u_uncompletedVideos.push($(this).attr('href'));
            }
            $('#test').find('.pull-right').find('i').attr('class') == 'icon-check' &&
                $('#test').find('.pull-right').find('i').css('color') == "rgb(255, 0, 0)"
        });
        console.log('Video mancanti: ', w4u_uncompletedVideos.length);

        if (window.location.href.indexOf(w4u_uncompletedVideos[0]) > -1) {
            console.log('Video corrente ok');
        } else {
            if (w4u_uncompletedVideos.length > 0) {
                console.log('Prossimo video: ', w4u_uncompletedVideos[0]);
                window.location.href = w4u_uncompletedVideos[0];
            } else {
                console.log('Lezione terminata, apro la prossima', w4u_lessonsGalleryUrl);
                window.location.href = w4u_lessonsGalleryUrl;
            }
        }

    }

    function w4u_startCurrentVideo() {
        $('#control-play').trigger('click');
        document.getElementById("my-video_html5_api").playbackRate = window.localStorage.getItem('w4u_videoSpeedMultiplier');
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

});
