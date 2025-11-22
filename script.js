document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרות בסיס וקבועים
    const mainCard = document.getElementById('mainProjectCard');
    const mainVideo = mainCard ? mainCard.querySelector('.project-video') : null;
    const regularModeButton = document.getElementById('regularMode');
    const scaryModeButton = document.getElementById('scaryMode');
    const cuteModeButton = document.getElementById('cuteMode');
    const body = document.body;
    const followerImage = document.getElementById('followerImage');
    const scaryEndScreen = document.getElementById('scaryEndScreen');
    const resetButton = document.getElementById('resetButton');
    const fishContainer = document.getElementById('collectibleFishContainer');
    const doneMessage = document.getElementById('doneMessage');
    const scaryRoarSound = document.getElementById('scaryRoarSound');
    const eatingSound = document.getElementById('eatingSound');
    const magicSound = document.getElementById('magicSound'); 

    // NEW: נתיב הבסיס הנדרש עבור GitHub Pages
    const BASE_PATH = "/portfolio/"; 

    // הגדרת קבצי הוידאו והתמונות
    const REGULAR_VIDEO_SRC = 'bearregular.webm';
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const REGULAR_BEAR_IMAGE = 'regular_bear.png'; 
    const SCARY_BEAR_IMAGE = 'scary_bear.png';     
    const FISH_IMAGE = 'fish.png'; // קובץ הדג לאיסוף
    const FOLLOWER_DEFAULT_IMAGE = 'follower_image.png'; // תמונת הדב במצב Cute
    
    const FULLSCREEN_DELAY_MS = 1500;
    const SCARY_END_HOLD_MS = 3000;
    const CUTE_VIDEO_DURATION_MS = 5000; 
    const NUMBER_OF_FISH = 10;
    const FOLLOWER_SIZE_INCREMENT = 35; 
    let currentFollowerSize = 80;
    let collectedFishCount = 0;

    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let scaryEndTimeout = null;
    let currentMode = 'regular';
    let currentVideoPlaying = false;
    
    // מנגנון הגנה
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !followerImage || !scaryEndScreen || !resetButton || !fishContainer || !doneMessage || !scaryRoarSound || !eatingSound || !magicSound) {
        console.error("Initialization failed: Required HTML elements not found.");
        return;
    }

    // פונקציה שמבטיחה שהוידאו מוכן לניגון
    mainVideo.onloadeddata = () => {
        if (currentMode === 'regular') {
            mainVideo.style.opacity = 1;
        }
    };

    // יצירת הדגים לאיסוף
    function createCollectibleFish() {
        if (fishContainer) fishContainer.innerHTML = '';
        collectedFishCount = 0;
        doneMessage.classList.remove('active');
        
        for (let i = 0; i < NUMBER_OF_FISH; i++) {
            const fish = document.createElement('img');
            fish.src = BASE_PATH + FISH_IMAGE; // שימוש ב-BASE_PATH
            fish.classList.add('collectible-fish');
            fish.style.left = `${Math.random() * (window.innerWidth - 100) + 50}px`;
            fish.style.top = `${Math.random() * (window.innerHeight - 100) + 50}px`;
            fishContainer.appendChild(fish);
        }
    }

    // הפעלת מצב ה-Follower (אוניברסלי לכל המצבים)
    function activateFollowerGame(imageSrc) {
        // 1. נקיון
        mainVideo.pause();
        mainVideo.style.opacity = 0;
        mainCard.style.pointerEvents = 'none';
        
        // 2. הפעלת Follower
        followerImage.src = BASE_PATH + imageSrc; // שימוש ב-BASE_PATH ובתמונה הנכונה
        followerImage.classList.add('active');
        body.classList.add('hide-cursor');
        
        // 3. התחלת משחק
        createCollectibleFish();
    }

    // בדיקת התנגשות
    function checkCollision() {
        if (!followerImage.classList.contains('active')) return;
        
        const followerRect = followerImage.getBoundingClientRect();
        const fishes = document.querySelectorAll('.collectible-fish:not(.collected)');
        
        fishes.forEach(fish => {
            const fishRect = fish.getBoundingClientRect();

            const isColliding = !(
                followerRect.right < fishRect.left ||
                followerRect.left > fishRect.right ||
                followerRect.bottom < fishRect.top ||
                followerRect.top > fishRect.bottom
            );

            if (isColliding) {
                currentFollowerSize += FOLLOWER_SIZE_INCREMENT; 
                body.style.setProperty('--follower-size', `${currentFollowerSize}px`);

                eatingSound.currentTime = 0; 
                eatingSound.play().catch(e => console.log("Eating sound playback blocked:", e));

                fish.classList.add('collected');
                collectedFishCount++;
                
                if (collectedFishCount === NUMBER_OF_FISH) {
                    doneMessage.classList.add('active');
                }
            }
        });
    }

    // 2. פונקציית מעבר מצבים (איפוס וטעינה מחדש)
    function switchMode(mode) {
        clearTimeout(fullscreenTimeout);
        clearTimeout(cuteVideoTimeout);
        clearTimeout(scaryEndTimeout);
        
        // עצירה ואיפוס סאונד
        scaryRoarSound.pause(); 
        scaryRoarSound.currentTime = 0; 
        eatingSound.pause(); 
        eatingSound.currentTime = 0; 
        magicSound.pause(); 
        magicSound.currentTime = 0; 
        
        // עצירה ואיפוס וידאו
        if (mainVideo) {
            mainVideo.pause();
            mainVideo.currentTime = 0;
            mainVideo.style.opacity = 1;
        }
        mainCard.style.pointerEvents = 'auto';
        currentVideoPlaying = false;
        
        // איפוס גודל הדב, דגים, ומסך סיום אימה 
        currentFollowerSize = 80;
        body.style.setProperty('--follower-size', `${currentFollowerSize}px`);
        if (fishContainer) fishContainer.innerHTML = '';
        collectedFishCount = 0;
        doneMessage.classList.remove('active');
        
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
                // תיקון נתיב וידאו באמצעות BASE_PATH
                if (mainVideo) mainVideo.src = BASE_PATH + SCARY_VIDEO_SRC;
                break;
            case 'cute':
                cuteModeButton.classList.add('active');
                // תיקון נתיב וידאו באמצעות BASE_PATH
                if (mainVideo) mainVideo.src = BASE_PATH + CUTE_MAGIC_VIDEO_SRC;
                break;
            default: // 'regular'
                regularModeButton.classList.add('active');
                // תיקון נתיב וידאו באמצעות BASE_PATH
                if (mainVideo) mainVideo.src = BASE_PATH + REGULAR_VIDEO_SRC;
                break;
        }
        if (mainVideo) mainVideo.load();
    }

    // 3. לוגיקת סיום אוניברסלית: מעבר למשחק ה-Follower בסיום הוידאו
    mainVideo.onended = () => {
        if (currentMode === 'scary') {
            activateFollowerGame(SCARY_BEAR_IMAGE);
            body.classList.remove('scary-mode'); 
            
        } else if (currentMode === 'regular') {
            activateFollowerGame(REGULAR_BEAR_IMAGE);
        
        }
        currentVideoPlaying = false; 
    };
    
    // 4. פונקציית התחלת אינטראקציה (Hover/Click)
    function startVideoAndTimer() {
        if (mainVideo && mainVideo.paused && !followerImage.classList.contains('active')) {
            mainVideo.play();
            currentVideoPlaying = true;
            
            if (currentMode === 'scary') {
                // מעבר למסך מלא אחרי 1.5 שניות
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS);
                
                // הפעלת השאגה מיד
                scaryRoarSound.play().catch(e => console.log("Sound playback blocked:", e));

            } else if (currentMode === 'cute') {
                // הפעלת צליל קסם מיד בכניסה למצב Cute
                magicSound.play().catch(e => console.log("Magic sound playback blocked:", e));
                
                // במצב Cute, משחק ה-Follower מופעל אחרי טיימר קבוע (5 שניות)
                cuteVideoTimeout = setTimeout(() => {
                    // הפעלת משחק ה-Follower (עם תמונה של ה-Follower המקורית)
                    activateFollowerGame(FOLLOWER_DEFAULT_IMAGE); 
                }, CUTE_VIDEO_DURATION_MS);
            }
        }
    }
    
    // 5. לוגיקת עקיבת עכבר (MouseMove)
    document.addEventListener('mousemove', (event) => {
        if (followerImage.classList.contains('active')) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            followerImage.style.left = `${mouseX}px`;
            followerImage.style.top = `${mouseY}px`;
            
            checkCollision();
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
