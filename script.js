document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרות בסיס
    const mainCard = document.getElementById('mainProjectCard');
    const mainVideo = mainCard ? mainCard.querySelector('.project-video') : null;
    const regularModeButton = document.getElementById('regularMode');
    const scaryModeButton = document.getElementById('scaryMode');
    const cuteModeButton = document.getElementById('cuteMode');
    const body = document.body;
    const followerImage = document.getElementById('followerImage');
    const scaryEndScreen = document.getElementById('scaryEndScreen');
    const resetButton = document.getElementById('resetButton');
    const fishContainer = document.getElementById('collectibleFishContainer'); // NEW

    // הגדרת קבצי הוידאו
    const REGULAR_VIDEO_SRC = 'bearregular.webm';
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const FULLSCREEN_DELAY_MS = 1500;
    const SCARY_END_HOLD_MS = 3000;
    const CUTE_VIDEO_DURATION_MS = 5000;
    const NUMBER_OF_FISH = 10; // NEW
    const FOLLOWER_SIZE_INCREMENT = 10; // NEW: הגדלה של 10px לכל דג שנאסף
    let currentFollowerSize = 80; // NEW: גודל התחלתי ב-CSS

    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let scaryEndTimeout = null;
    let currentMode = 'regular';
    let currentVideoPlaying = false;
    
    // מנגנון הגנה
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !followerImage || !scaryEndScreen || !resetButton || !fishContainer) {
        console.error("Initialization failed: Required HTML elements not found.");
        return;
    }

    // פונקציה שמבטיחה שהוידאו מוכן לניגון (Regular Mode Fix)
    mainVideo.onloadeddata = () => {
        if (currentMode === 'regular') {
            mainVideo.style.opacity = 1;
        }
    };

    // NEW: יצירת הדגים לאיסוף
    function createCollectibleFish() {
        if (fishContainer) fishContainer.innerHTML = ''; // מנקה דגים קודמים
        
        for (let i = 0; i < NUMBER_OF_FISH; i++) {
            const fish = document.createElement('img');
            fish.src = 'fish.png';
            fish.classList.add('collectible-fish');
            fish.style.left = `${Math.random() * (window.innerWidth - 100) + 50}px`; // מיקום אקראי
            fish.style.top = `${Math.random() * (window.innerHeight - 100) + 50}px`;
            fishContainer.appendChild(fish);
        }
    }

    // NEW: בדיקת התנגשות (Collision Detection)
    function checkCollision() {
        if (!followerImage.classList.contains('active')) return;
        
        const followerRect = followerImage.getBoundingClientRect();
        const fishes = document.querySelectorAll('.collectible-fish:not(.collected)');
        
        fishes.forEach(fish => {
            const fishRect = fish.getBoundingClientRect();

            // בדיקת התנגשות בין שני מלבנים
            const isColliding = !(
                followerRect.right < fishRect.left ||
                followerRect.left > fishRect.right ||
                followerRect.bottom < fishRect.top ||
                followerRect.top > fishRect.bottom
            );

            if (isColliding) {
                // 1. הגדלת ה-Follower
                currentFollowerSize += FOLLOWER_SIZE_INCREMENT;
                body.style.setProperty('--follower-size', `${currentFollowerSize}px`);

                // 2. העלמת הדג
                fish.classList.add('collected');
                console.log(`Fish collected! Follower size is now: ${currentFollowerSize}px`);
            }
        });
    }


    // 2. פונקציית מעבר מצבים (איפוס וטעינה מחדש)
    function switchMode(mode) {
        clearTimeout(fullscreenTimeout);
        clearTimeout(cuteVideoTimeout);
        clearTimeout(scaryEndTimeout);
        
        // עצירה ואיפוס וידאו
        if (mainVideo) {
            mainVideo.pause();
            mainVideo.currentTime = 0;
            mainVideo.style.opacity = 1;
        }
        mainCard.style.pointerEvents = 'auto';
        currentVideoPlaying = false;
        
        // איפוס גודל הדב ודגים
        currentFollowerSize = 80;
        body.style.setProperty('--follower-size', `${currentFollowerSize}px`);
        if (fishContainer) fishContainer.innerHTML = ''; // מנקה את כל הדגים לאיסוף
        
        // איפוס קלאסים ומסך סיום
        mainCard.classList.remove('fullscreen-video');
        body.classList.remove('scary-mode');
        body.classList.remove('hide-cursor');
        followerImage.classList.remove('active');
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
        if (mainVideo) mainVideo.load();
    }

    // 3. לוגיקת סיום למצב מפחיד (פריים אחרון וכפתור)
    mainVideo.onended = () => {
        if (currentMode === 'scary') {
            mainVideo.pause();
            
            // לקיחת הפריים האחרון
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
        if (mainVideo && mainVideo.paused && !followerImage.classList.contains('active')) {
            mainVideo.play();
            currentVideoPlaying = true;
            
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
                    
                    // NEW: יצירת הדגים רק לאחר שהוידאו הסתיים
                    createCollectibleFish();
                }, CUTE_VIDEO_DURATION_MS);
            }
        }
    }
    
    // 5. לוגיקת עקיבת עכבר (MouseMove) - תיקון למיקום מרכזי וזיהוי התנגשות
    document.addEventListener('mousemove', (event) => {
        if (followerImage.classList.contains('active')) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            followerImage.style.left = `${mouseX}px`;
            followerImage.style.top = `${mouseY}px`;
            
            // NEW: בדיקת התנגשות כל פעם שהעכבר זז
            if (currentMode === 'cute') {
                checkCollision();
            }
        }
    });

    // 6. אירועי בקרת משתמש
    mainCard.addEventListener('mouseenter', startVideoAndTimer);
    mainCard.addEventListener('mouseleave', () => {
        if (currentMode === 'regular' && currentVideoPlaying) {
            mainVideo.pause();
            mainVideo.currentTime = 0;
            currentVideoPlaying = false;
        }
    });
    
    mainCard.addEventListener('click', () => {
        const isEffectActive = followerImage.classList.contains('active') || mainCard.classList.contains('fullscreen-video');

        if (isEffectActive || currentVideoPlaying) {
            switchMode(currentMode);
        } else {
            startVideoAndTimer();
        }
    });

    // 7. לוגיקת כפתורים
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    cuteModeButton.addEventListener('click', () => switchMode('cute'));
    resetButton.addEventListener('click', () => switchMode('regular'));

    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
