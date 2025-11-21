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

    // הגדרת קבצי הוידאו והתמונות החדשות
    const REGULAR_VIDEO_SRC = 'bearregular.webm';
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const REGULAR_BEAR_IMAGE = 'regular_bear.png'; // NEW
    const SCARY_BEAR_IMAGE = 'scary_bear.png';     // NEW
    
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

    // יצירת הדגים לאיסוף (לוגיקה קיימת)
    function createCollectibleFish() {
        if (fishContainer) fishContainer.innerHTML = '';
        collectedFishCount = 0;
        doneMessage.classList.remove('active');
        
        for (let i = 0; i < NUMBER_OF_FISH; i++) {
            const fish = document.createElement('img');
            fish.src = 'fish.png';
            fish.classList.add('collectible-fish');
            fish.style.left = `${Math.random() * (window.innerWidth - 100) + 50}px`;
            fish.style.top = `${Math.random() * (window.innerHeight - 100) + 50}px`;
            fishContainer.appendChild(fish);
        }
    }

    // הפעלת מצב ה-Follower (חדש: מאחד את הלוגיקה של Cute, Regular ו-Scary)
    function activateFollowerGame(imageSrc) {
        // 1. נקיון
        mainVideo.pause();
        mainVideo.style.opacity = 0;
        mainCard.style.pointerEvents = 'none';
        
        // 2. הפעלת Follower
        followerImage.src = imageSrc; // החלפת תמונת ה-Follower
        followerImage.classList.add('active');
        body.classList.add('hide-cursor');
        
        // 3. התחלת משחק
        createCollectibleFish();
    }

    // בדיקת התנגשות (לוגיקה קיימת)
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
        
        // איפוס גודל הדב, דגים, ומסך סיום אימה (NEW: איפוס מסך סיום אימה)
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
        scaryEndScreen.style.backgroundImage = 'none'; // NEW
        
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

    // 3. לוגיקת סיום למצב מפחיד ולמצב רגיל (NEW: לוגיקת סיום אוניברסלית)
    mainVideo.onended = () => {
        if (currentMode === 'scary') {
             // NEW: הפעלת משחק ה-Follower במקום מסך הסיום הקודם
            activateFollowerGame(SCARY_BEAR_IMAGE);
            body.classList.remove('scary-mode'); // יציאה ממצב מסך מלא
            
        } else if (currentMode === 'regular') {
            // NEW: הפעלת משחק ה-Follower
            activateFollowerGame(REGULAR_BEAR_IMAGE);
        
        } else if (currentMode === 'cute') {
            // במצב Cute, ה-activateFollowerGame מופעל כבר מהטיימר ב-startVideoAndTimer
            // אין צורך לעשות כאן כלום, כי הלוגיקה כבר מטופלת בטיימר.
            // הדבר היחיד שצריך לוודא הוא שהטיימר אכן סיים.
        }
        currentVideoPlaying = false; // עדכון מצב הוידאו
    };
    
    // 4. פונקציית התחלת אינטראקציה (Hover/Click)
    function startVideoAndTimer() {
        if (mainVideo && mainVideo.paused && !followerImage.classList.contains('active')) {
            mainVideo.play();
            currentVideoPlaying = true;
            
            if (currentMode === 'scary') {
                // מעבר למסך מלא אחרי 1.5 שניות (יישאר עד שהווידאו יסתיים)
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
                    // כאשר הטיימר מסתיים, הפעלת משחק ה-Follower (עם תמונה של ה-Follower המקורית)
                    activateFollowerGame('follower_image.png');
                    // ה-onended של הוידאו של cute כבר לא רלוונטי בגלל שהפעלנו pause כאן
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
            
            // בדיקת התנגשות מתבצעת בכל המצבים שהפעלנו את משחק ה-Follower
            checkCollision();
        }
    });

    // 6. אירועי בקרת משתמש (לוגיקה קיימת)
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

    // 7. לוגיקת כפתורים (לוגיקה קיימת)
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    cuteModeButton.addEventListener('click', () => switchMode('cute'));
    resetButton.addEventListener('click', () => switchMode('regular'));

    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
