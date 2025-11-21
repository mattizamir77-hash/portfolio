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
    const fishContainer = document.getElementById('collectibleFishContainer');
    const doneMessage = document.getElementById('doneMessage');
    const scaryRoarSound = document.getElementById('scaryRoarSound'); 

    // הגדרת קבצי הוידאו
    const REGULAR_VIDEO_SRC = 'bearregular.webm';
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    
    const FULLSCREEN_DELAY_MS = 1500;
    // const ROAR_DELAY_MS = 2000; // הוסר
    const SCARY_END_HOLD_MS = 3000;
    const CUTE_VIDEO_DURATION_MS = 5000;
    const NUMBER_OF_FISH = 10;
    const FOLLOWER_SIZE_INCREMENT = 20;
    let currentFollowerSize = 80;
    let collectedFishCount = 0;

    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let scaryEndTimeout = null;
    // let roarTimeout = null; // הוסר
    let currentMode = 'regular';
    let currentVideoPlaying = false;
    
    // מנגנון הגנה
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !followerImage || !scaryEndScreen || !resetButton || !fishContainer || !doneMessage || !scaryRoarSound) {
        console.error("Initialization failed: Required HTML elements not found.");
        return;
    }

    // פונקציה שמבטיחה שהוידאו מוכן לניגון (Regular Mode Fix)
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

                fish.classList.add('collected');
                collectedFishCount++;
                console.log(`Fish collected! Follower size is now: ${currentFollowerSize}px. Collected: ${collectedFishCount}/${NUMBER_OF_FISH}`);

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
        // clearTimeout(roarTimeout); // הוסר
        
        // עצירה ואיפוס סאונד
        scaryRoarSound.pause(); 
        scaryRoarSound.currentTime = 0; 
        
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

    // 3. לוגיקת סיום למצב מפחיד (לוגיקה קיימת)
    mainVideo.onended = () => {
        if (currentMode === 'scary') {
            mainVideo.pause();
            
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
                // מעבר למסך מלא אחרי 1.5 שניות
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS);
                
                // הפעלת השאגה מיד (NEW)
                scaryRoarSound.play().catch(e => console.log("Sound playback blocked:", e));

            } else if (currentMode === 'cute') {
                cuteVideoTimeout = setTimeout(() => {
                    mainVideo.pause();
                    mainVideo.style.opacity = 0;
                    mainCard.style.pointerEvents = 'none';
                    followerImage.classList.add('active');
                    body.classList.add('hide-cursor');
                    
                    createCollectibleFish();
                }, CUTE_VIDEO_DURATION_MS);
            }
        }
    }
    
    // 5. לוגיקת עקיבת עכבר (לוגיקה קיימת)
    document.addEventListener('mousemove', (event) => {
        if (followerImage.classList.contains('active')) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            followerImage.style.left = `${mouseX}px`;
            followerImage.style.top = `${mouseY}px`;
            
            if (currentMode === 'cute') {
                checkCollision();
            }
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
