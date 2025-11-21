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
    const SCARY_VIDEO_SRC = 'scaryvideo.mp4';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const FULLSCREEN_DELAY_MS = 3000; // 3 שניות לאפקט המפחיד
    const CUTE_VIDEO_DURATION_MS = 5000; // <-- שונה ל-5 שניות
    
    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let currentMode = 'regular'; 
    
    // מנגנון הגנה: אם אחד הרכיבים לא נמצא
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !followerImage) {
        console.error("Initialization failed: One or more required HTML elements not found.");
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
        mainVideo.style.opacity = 1; // מוודא שהוידאו גלוי כשחוזרים
        mainCard.style.pointerEvents = 'auto'; // מחזיר אינטראקציה עם הכרטיס
        
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
        if (mainVideo.paused && !followerImage.classList.contains('active')) { // מוודא שהאינטראקציה לא כבר פעילה
            mainVideo.play();
            
            if (currentMode === 'scary') {
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS); 
            } else if (currentMode === 'cute') {
                cuteVideoTimeout = setTimeout(() => {
                    mainVideo.pause(); 
                    mainVideo.style.opacity = 0; // מעלים את הוידאו
                    mainCard.style.pointerEvents = 'none'; // מונע אינטראקציה עם הכרטיס
                    followerImage.classList.add('active'); // מציג את התמונה העוקבת
                    body.classList.add('hide-cursor'); // מסתיר את סמן העכבר הרגיל
                }, CUTE_VIDEO_DURATION_MS);
            }
        }
    }

    // 4. פונקציית איפוס כללית (מופעלת רק בלחיצה)
    function stopVideoAndReset() {
        // איפוס כל המצבים על ידי קריאה ל-switchMode במצב הנוכחי, ובכך לא מאתחל את הוידאו
        switchMode(currentMode);
    }
    
    // 5. לוגיקת עקיבת עכבר עבור followerImage (אך רק כשהוא פעיל)
    document.addEventListener('mousemove', (event) => {
        if (followerImage.classList.contains('active')) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            // מזיזים את התמונה למרכז העכבר (בהנחה שרוחב התמונה 60px)
            followerImage.style.transform = `translate(${mouseX - 30}px, ${mouseY - 30}px)`; 
        }
    });

    // 6. אירועי בקרת משתמש

    // Hover - רק מתחיל את האינטראקציה
    mainCard.addEventListener('mouseenter', startVideoAndTimer);
    
    // Mouseleave - מוסר כליל! לא מאפס את האינטראקציה.

    // Click - משמש גם להתחלה (במקום Hover) וגם לאיפוס
    mainCard.addEventListener('click', () => {
        const isEffectActive = followerImage.classList.contains('active') || mainCard.classList.contains('fullscreen-video');

        if (isEffectActive || !mainVideo.paused) {
            // אם אפקט פעיל (עוקב/פולסקרין) או שהוידאו עדיין רץ, בצע איפוס
            stopVideoAndReset();
        } else {
            // אם הוידאו מושהה ואין אפקט, התחל את האינטראקציה
            startVideoAndTimer();
        }
    });


    // 7. לוגיקת כפתורים
    regularModeButton.addEventListener('click', () => stopVideoAndReset('regular'));
    scaryModeButton.addEventListener('click', () => stopVideoAndReset('scary'));
    cuteModeButton.addEventListener('click', () => stopVideoAndReset('cute')); 
    
    // מכיוון שפונקציית switchMode מטפלת באיפוס המלא, נשתמש בה ישירות בלחיצות על הכפתורים:
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    cuteModeButton.addEventListener('click', () => switchMode('cute')); 


    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
