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

    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton) {
        // מנגנון הגנה: אם אחד הרכיבים לא נמצא
        console.error("One or more required elements were not found in the HTML.");
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
        
        if (mode === 'scary') {
            currentMode = 'scary';
            scaryModeButton.classList.add('active');
            
            // החלפת סורס הוידאו לסרטון המפחיד
            mainVideo.src = SCARY_VIDEO_SRC;
            mainVideo.load();
            mainVideo.pause(); // מוודאים שהוא מוכן
            
            // הגדרת טיימר לפריצת המסך
            fullscreenTimeout = setTimeout(() => {
                // רק אם הוידאו פועל במצב מפחיד, הוא יכול להתפרס
                if (mainVideo.paused === false && currentMode === 'scary') {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }
            }, FULLSCREEN_DELAY_MS); 
            
        } else { // מצב רגיל
            currentMode = 'regular';
            regularModeButton.classList.add('active');
            
            // החלפת סורס הוידאו לסרטון הרגיל
            mainVideo.src = REGULAR_VIDEO_SRC;
            mainVideo.load();
            mainVideo.pause(); // מוודאים שהוא מוכן
        }
    }
    
    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');

    // 3. לוגיקת Hover להפעלה/עצירה של הוידאו
    mainCard.addEventListener('mouseenter', () => {
        // אם הוידאו לא פועל, הפעל אותו
        if (mainVideo.paused) {
            mainVideo.play();
        }
    });

    mainCard.addEventListener('mouseleave', () => {
        // תמיד עצור את הוידאו ביציאה
        mainVideo.pause();
        mainVideo.currentTime = 0; // אחזר להתחלה
        
        // ביציאה, אם היינו במצב מפחיד, בטל את הפול סקרין
        if (currentMode === 'scary') {
            clearTimeout(fullscreenTimeout);
            mainCard.classList.remove('fullscreen-video');
            body.classList.remove('scary-mode');
        }
    });

    // 4. לוגיקת כפתורים
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
});
