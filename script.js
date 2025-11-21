document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרות בסיס
    const mainCard = document.getElementById('mainProjectCard');
    const mainVideo = mainCard ? mainCard.querySelector('.project-video') : null;
    const regularModeButton = document.getElementById('regularMode');
    const scaryModeButton = document.getElementById('scaryMode');
    const body = document.body;

    // הגדרת קבצי הוידאו
    const REGULAR_VIDEO_SRC = 'bearvideo.mp4';
    const SCARY_VIDEO_SRC = 'scaryvideo.mp4';
    const FULLSCREEN_DELAY_MS = 3000; // 3 שניות

    let fullscreenTimeout = null;
    let currentMode = 'regular'; // מצב ברירת מחדל
    
    // מנגנון הגנה: אם אחד הרכיבים לא נמצא
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton) {
        console.error("Initialization failed: Required HTML elements not found.");
        return;
    }

    // 2. פונקציית מעבר מצבים
    function switchMode(mode) {
        // איפוס טיימר קיים
        clearTimeout(fullscreenTimeout);
        
        // הסרת כל קלאס של מצב
        mainCard.classList.remove('fullscreen-video');
        body.classList.remove('scary-mode');
        
        // עדכון כפתורי הסקאלה
        regularModeButton.classList.remove('active');
        scaryModeButton.classList.remove('active');
        
        // עצירה ואיפוס וידאו
        mainVideo.pause();
        mainVideo.currentTime = 0;
        
        if (mode === 'scary') {
            currentMode = 'scary';
            scaryModeButton.classList.add('active');
            
            // החלפת סורס הוידאו לסרטון המפחיד
            mainVideo.src = SCARY_VIDEO_SRC;
            mainVideo.load();
            
        } else { // מצב רגיל
            currentMode = 'regular';
            regularModeButton.classList.add('active');
            
            // החלפת סורס הוידאו לסרטון הרגיל
            mainVideo.src = REGULAR_VIDEO_SRC;
            mainVideo.load();
        }
    }
    
    // 3. לוגיקת Hover ו-Click להפעלה/עצירה של הוידאו
    function startVideoAndTimer() {
        if (mainVideo.paused) {
            mainVideo.play();
            
            if (currentMode === 'scary') {
                // הגדרת טיימר לפריצת המסך רק במצב מפחיד
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS); 
            }
        }
    }

    function stopVideoAndReset() {
        mainVideo.pause();
        mainVideo.currentTime = 0;
        
        // ביטול טיימר ואיפוס פול סקרין
        clearTimeout(fullscreenTimeout);
        mainCard.classList.remove('fullscreen-video');
        body.classList.remove('scary-mode');
    }
    
    // אירועי Hover
    mainCard.addEventListener('mouseenter', startVideoAndTimer);
    mainCard.addEventListener('mouseleave', stopVideoAndReset);
    
    // אירוע Click (למקרה שה-Hover נחסם)
    mainCard.addEventListener('click', () => {
        if (mainVideo.paused) {
            startVideoAndTimer();
        } else {
            stopVideoAndReset();
        }
    });


    // 4. לוגיקת כפתורים
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    
    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
