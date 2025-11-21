document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרות בסיס
    const mainCard = document.getElementById('mainProjectCard');
    const mainVideo = mainCard ? mainCard.querySelector('.project-video') : null;
    const regularModeButton = document.getElementById('regularMode');
    const scaryModeButton = document.getElementById('scaryMode');
    const cuteModeButton = document.getElementById('cuteMode');
    const body = document.body;
    const scaryEndScreen = document.getElementById('scaryEndScreen');
    const resetButton = document.getElementById('resetButton');

    // הגדרת קבצי הוידאו
    const REGULAR_VIDEO_SRC = 'bearvideo.mp4'; 
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const FULLSCREEN_DELAY_MS = 1500; 
    const SCARY_END_HOLD_MS = 3000; 
    
    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let scaryEndTimeout = null; 
    let currentMode = 'regular'; 
    let currentVideoPlaying = false; 
    
    // מנגנון הגנה קריטי
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !scaryEndScreen || !resetButton) {
        console.error("Initialization failed: Missing critical HTML elements.");
        // We stop here to prevent JS errors from cascading
        return;
    }

    // 2. פונקציית מעבר מצבים (איפוס וטעינה מחדש)
    function switchMode(mode) {
        // ניקוי טיימרים
        clearTimeout(fullscreenTimeout);
        clearTimeout(cuteVideoTimeout);
        clearTimeout(scaryEndTimeout);
        
        // עצירה ואיפוס וידאו
        if (mainVideo) {
            mainVideo.pause();
            mainVideo.currentTime = 0;
            mainVideo.style.opacity = 1; 
        }
        currentVideoPlaying = false; 
        
        // איפוס קלאסים ומסך סיום
        mainCard.classList.remove('fullscreen-video');
        body.classList.remove('scary-mode');
        scaryEndScreen.classList.remove('active'); 
        scaryEndScreen.style.backgroundImage = 'none'; 
        
        // עדכון כפתורי הסקאלה
        document.querySelectorAll('.mode-toggle button').forEach(btn => btn.classList.remove('active'));
        
        currentMode = mode;

        switch (mode) {
            case 'scary':
                scaryModeButton.classList.add('active');
                if (mainVideo) mainVideo.src = SCARY_VIDEO_SRC;
                break;
            case 'cute':
                cuteModeButton.classList.add('active');
                if (mainVideo) mainVideo.src = CUTE_MAGIC_VIDEO_SRC;
                break;
            default: // 'regular'
                regularModeButton.classList.add('active');
                if (mainVideo) mainVideo.src = REGULAR_VIDEO_SRC;
                break;
        }
        if (mainVideo) mainVideo.load(); // טוען את המקור החדש
    }

    // 3. לוגיקת סיום למצב מפחיד (פריים אחרון וכפתור)
    mainVideo.onended = () => {
        if (currentMode === 'scary') {
            mainVideo.pause(); 
            
            // לקיחת הפריים האחרון לתמונת רקע
            const canvas = document.createElement('canvas');
            canvas.width = mainVideo.videoWidth;
            canvas.height = mainVideo.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL('image/png');
            scaryEndScreen.style.backgroundImage = `url(${imageUrl})`;
            
            scaryEndTimeout = setTimeout(() => {
                scaryEndScreen.classList.add('active'); 
            }, SCARY_END_HOLD_MS);
        }
    };
    
    // 4. פונקציית התחלת אינטראקציה (Hover/Click)
    function startVideoAndTimer() {
        if (mainVideo) {
            
            if (currentMode === 'regular' && mainVideo.paused) { 
                 mainVideo.play().catch(e => console.error("Regular play failed:", e));
                 currentVideoPlaying = true;
                 return;
            } else if (currentMode === 'regular' && currentVideoPlaying) {
                return; // אם רגיל וכבר מנגן
            }
            
            // לוגיקת מצבים מפחיד/חמוד
            if (currentMode !== 'regular') {
                mainVideo.play().catch(e => console.error(`${currentMode} play failed:`, e));
                currentVideoPlaying = true;
            } 
            
            // לוגיקת טיימרים
            if (currentMode === 'scary') {
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS); 
            } else if (currentMode === 'cute') {
                 // במצב חמוד, הוידאו ינגן 5 שניות ויעצור
                cuteVideoTimeout = setTimeout(() => {
                    mainVideo.pause(); 
                    mainVideo.currentTime = 0;
                    currentVideoPlaying = false;
                }, 5000); 
            }
        }
    }

    // 5. אירועי בקרת משתמש
    mainCard.addEventListener('mouseenter', startVideoAndTimer);
    
    mainCard.addEventListener('mouseleave', () => {
        // עצירת וידאו במצב רגיל בלבד
        if (currentMode === 'regular' && currentVideoPlaying) {
            mainVideo.pause();
            mainVideo.currentTime = 0;
            currentVideoPlaying = false;
        }
        // ניקוי טיימרים למצבים אחרים
        if (currentMode !== 'regular') {
            clearTimeout(fullscreenTimeout);
            clearTimeout(cuteVideoTimeout);
        }
    });
    
    mainCard.addEventListener('click', () => {
        // איפוס במצבים ספציפיים
        if (mainCard.classList.contains('fullscreen-video') || currentVideoPlaying) { 
            switchMode('regular'); 
        } else {
            // אם קליק כששום דבר לא קורה, התחל את האינטראקציה (בדומה ל-mouseenter)
            startVideoAndTimer();
        }
    });

    // 6. לוגיקת כפתורים (מגיבה ל-Click)
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    cuteModeButton.addEventListener('click', () => switchMode('cute')); 
    resetButton.addEventListener('click', () => switchMode('regular')); 

    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
