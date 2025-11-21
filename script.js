document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרות בסיס
    const mainCard = document.getElementById('mainProjectCard');
    const mainVideo = mainCard ? mainCard.querySelector('.project-video') : null;
    const regularModeButton = document.getElementById('regularMode');
    const scaryModeButton = document.getElementById('scaryMode');
    const cuteModeButton = document.getElementById('cuteMode');
    const body = document.body;
    const followerImage = document.getElementById('followerImage');

    // הגדרת קבצי הוידאו
    const REGULAR_VIDEO_SRC = 'bearvideo.mp4';
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const FULLSCREEN_DELAY_MS = 3000; // 3 שניות לאפקט המפחיד
    const CUTE_VIDEO_DURATION_MS = 5000; // 5 שניות לווידאו החמוד
    
    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let currentMode = 'regular'; 
    
    // מנגנון הגנה
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !followerImage) {
        console.error("Initialization failed: Required HTML elements not found.");
        return;
    }

    // 2. פונקציית מעבר מצבים
    function switchMode(mode) {
        // איפוס כל הטיימרים והמצבים הקודמים
        clearTimeout(fullscreenTimeout);
        clearTimeout(cuteVideoTimeout);
        
        // עצירה ואיפוס וידאו
        mainVideo.pause();
        mainVideo.currentTime = 0;
        mainVideo.style.opacity = 1; 
        mainCard.style.pointerEvents = 'auto'; 
        
        // איפוס קלאסים
        mainCard.classList.remove('fullscreen-video');
        body.classList.remove('scary-mode');
        body.classList.remove('hide-cursor');
        followerImage.classList.remove('active'); 
        
        // עדכון כפתורי הסקאלה
        regularModeButton.classList.remove('active');
        scaryModeButton.classList.remove('active');
        cuteModeButton.classList.remove('active');
        
        currentMode = mode;

        switch (mode) {
            case 'scary':
                scaryModeButton.classList.add('active');
                mainVideo.src = SCARY_VIDEO_SRC;
                mainVideo.load();
                break;
            case 'cute':
                cuteModeButton.classList.add('active');
                mainVideo.src = CUTE_MAGIC_VIDEO_SRC;
                mainVideo.load();
                break;
            default: // 'regular'
                regularModeButton.classList.add('active');
                mainVideo.src = REGULAR_VIDEO_SRC;
                mainVideo.load();
                break;
        }
    }
    
    // 3. פונקציית התחלת אינטראקציה
    function startVideoAndTimer() {
        if (mainVideo.paused && !followerImage.classList.contains('active')) {
            mainVideo.play();
            
            if (currentMode === 'scary') {
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS); 
            } else if (currentMode === 'cute') {
                cuteVideoTimeout = setTimeout(() => {
                    mainVideo.pause(); 
                    mainVideo.style.opacity = 0; 
                    mainCard.style.pointerEvents = 'none'; 
                    followerImage.classList.add('active'); 
                    body.classList.add('hide-cursor'); 
                }, CUTE_VIDEO_DURATION_MS);
            }
        }
    }

    // 4. פונקציית איפוס כללית (מופעלת רק בלחיצה)
    function stopVideoAndReset() {
        switchMode(currentMode);
    }
    
    // 5. לוגיקת עקיבת עכבר עבור followerImage 
    document.addEventListener('mousemove', (event) => {
        if (followerImage.classList.contains('active')) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            followerImage.style.transform = `translate(${mouseX - 30}px, ${mouseY - 30}px)`; 
        }
    });

    // 6. אירועי בקרת משתמש
    mainCard.addEventListener('mouseenter', startVideoAndTimer);
    
    mainCard.addEventListener('click', () => {
        const isEffectActive = followerImage.classList.contains('active') || mainCard.classList.contains('fullscreen-video');

        if (isEffectActive || !mainVideo.paused) {
            stopVideoAndReset();
        } else {
            startVideoAndTimer();
        }
    });

    // 7. לוגיקת כפתורים
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    cuteModeButton.addEventListener('click', () => switchMode('cute')); 
    
    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
