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
    const fishContainer = document.getElementById('fishContainer'); 

    // הגדרת קבצי הוידאו
    const REGULAR_VIDEO_SRC = 'bearvideo.mp4';
    const SCARY_VIDEO_SRC = 'scaryvideo.webm';
    const CUTE_MAGIC_VIDEO_SRC = 'cutemagicvideo.mp4';
    const FISH_IMAGE_SRC = 'fish.png'; // קובץ הדג

    const FULLSCREEN_DELAY_MS = 1500; 
    const SCARY_END_HOLD_MS = 3000; 
    const CUTE_VIDEO_DURATION_MS = 5000; 
    const FISH_COUNT = 10; // מספר הדגים
    const FISH_GROW_PERCENT = 0.5; // הגדלה רגעית (50% גדילה ואז נעלם)
    
    let fullscreenTimeout = null;
    let cuteVideoTimeout = null;
    let scaryEndTimeout = null; 
    let currentMode = 'regular'; 
    let currentVideoPlaying = false; 
    let fishElements = []; 
    let touchedFishCount = 0; 
    
    // מנגנון הגנה
    if (!mainCard || !mainVideo || !regularModeButton || !scaryModeButton || !cuteModeButton || !followerImage || !scaryEndScreen || !resetButton || !fishContainer) {
        console.error("Initialization failed: Required HTML elements not found.");
        return;
    }

    // 2. פונקציית מעבר מצבים (איפוס וטעינה מחדש)
    function switchMode(mode) {
        // ניקוי כל המצבים הפעילים
        clearTimeout(fullscreenTimeout);
        clearTimeout(cuteVideoTimeout);
        clearTimeout(scaryEndTimeout);
        clearFishGame(); // קריטי: ניקוי הדגים
        
        // עצירה ואיפוס וידאו
        if (mainVideo) {
            mainVideo.pause();
            mainVideo.currentTime = 0;
            mainVideo.style.opacity = 1; 
        }
        mainCard.style.pointerEvents = 'auto'; 
        currentVideoPlaying = false; 
        
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
                
                cuteVideoTimeout = setTimeout(() => {
                    mainVideo.pause(); 
                    mainVideo.style.opacity = 0; 
                    mainCard.style.pointerEvents = 'none'; 
                    followerImage.classList.add('active'); 
                    body.classList.add('hide-cursor'); 
                    initFishGame(); // <--- קריטי: מתחיל את משחק הדגים
                }, CUTE_VIDEO_DURATION_MS);
                break;
            default: // 'regular'
                regularModeButton.classList.add('active');
                if (mainVideo) mainVideo.src = REGULAR_VIDEO_SRC;
                break;
        }
        if (mainVideo) mainVideo.load(); 
    }

    // 3. פונקציות ניהול דגים
    function createFish() {
        const fish = document.createElement('img');
        fish.src = FISH_IMAGE_SRC;
        fish.classList.add('fish');
        fish.dataset.originalScale = 1; 
        
        // מיקום אקראי על המסך - נותן מרווח קטן מהקצוות
        const minMargin = 80;
        const x = Math.random() * (window.innerWidth - 2 * minMargin) + minMargin; 
        const y = Math.random() * (window.innerHeight - 2 * minMargin) + minMargin; 
        
        fish.style.left = `${x}px`;
        fish.style.top = `${y}px`;

        // זווית אקראית - יוצר פיזור
        const rotation = Math.random() * 360; 
        fish.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        
        fishContainer.appendChild(fish);
        fishElements.push(fish);
    }

    function initFishGame() {
        clearFishGame(); 
        for (let i = 0; i < FISH_COUNT; i++) {
            createFish();
        }
    }

    function clearFishGame() {
        fishElements.forEach(fish => fish.remove());
        fishElements = [];
        touchedFishCount = 0;
    }

    function checkFishCollision() {
        if (!followerImage.classList.contains('active')) return; 

        const followerRect = followerImage.getBoundingClientRect();
        
        for (let i = fishElements.length - 1; i >= 0; i--) {
            const fish = fishElements[i];
            const fishRect = fish.getBoundingClientRect();

            const collision = !(
                followerRect.right < fishRect.left ||
                followerRect.left > fishRect.right ||
                followerRect.bottom < fishRect.top ||
                followerRect.top > fishRect.bottom
            );

            if (collision) {
                touchedFishCount++;

                // 1. הגדלה רגעית (Vibe Coding)
                let currentScale = parseFloat(fish.dataset.originalScale);
                currentScale += FISH_GROW_PERCENT; 
                
                // ודא שהטרנספורם שומר גם את הסיבוב
                const currentTransform = fish.style.transform;
                const rotateMatch = currentTransform.match(/rotate\(([^)]+)\)/);
                const currentRotation = rotateMatch ? rotateMatch[1] : '0deg';
                
                fish.style.transform = `translate(-50%, -50%) scale(${currentScale}) rotate(${currentRotation})`;
                
                // 2. העלמת הדג והסרתו מהמערך
                fish.remove(); 
                fishElements.splice(i, 1); 

                // 3. בדיקה אם כל הדגים נגעו
                if (touchedFishCount === FISH_COUNT) {
                    setTimeout(() => {
                        alert("You've collected all the objects! Resetting mode.");
                        switchMode('regular'); // איפוס למצב רגיל
                    }, 500); 
                    return; 
                }
            }
        }
    }

    // 4. לוגיקת סיום למצב מפחיד (פריים אחרון וכפתור)
    mainVideo.onended = () => {
        if (currentMode === 'scary') {
            // ... (קוד שמירת הפריים האחרון) ...
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
    
    // 5. פונקציית התחלת אינטראקציה (Hover/Click)
    function startVideoAndTimer() {
        if (mainVideo && mainVideo.paused && !followerImage.classList.contains('active')) {
            mainVideo.play();
            currentVideoPlaying = true; 
            
            if (currentMode === 'scary') {
                // ... (הגדרת טיימר לפריצת המסך) ...
                fullscreenTimeout = setTimeout(() => {
                    mainCard.classList.add('fullscreen-video');
                    body.classList.add('scary-mode');
                }, FULLSCREEN_DELAY_MS); 
            } else if (currentMode === 'cute') {
                // ... (הגדרת טיימר למשחק הדגים) ...
                cuteVideoTimeout = setTimeout(() => {
                    mainVideo.pause(); 
                    mainVideo.style.opacity = 0; 
                    mainCard.style.pointerEvents = 'none'; 
                    followerImage.classList.add('active'); 
                    body.classList.add('hide-cursor'); 
                    initFishGame(); 
                }, CUTE_VIDEO_DURATION_MS);
            }
        }
    }

    // 6. פונקציית איפוס כללית (מופעלת רק בלחיצה)
    function stopVideoAndReset() {
        switchMode(currentMode);
    }
    
    // 7. לוגיקת עקיבת עכבר (MouseMove)
    document.addEventListener('mousemove', (event) => {
        if (followerImage.classList.contains('active')) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            // עדכון מיקום הדב
            followerImage.style.left = `${mouseX}px`; 
            followerImage.style.top = `${mouseY}px`;

            // בדיקת מגע עם דגים
            if (currentMode === 'cute') {
                checkFishCollision();
            }
        }
    });

    // 8. אירועי בקרת משתמש
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

    // 9. לוגיקת כפתורים
    regularModeButton.addEventListener('click', () => switchMode('regular'));
    scaryModeButton.addEventListener('click', () => switchMode('scary'));
    cuteModeButton.addEventListener('click', () => switchMode('cute')); 
    resetButton.addEventListener('click', () => switchMode('regular')); 

    // הפעלת מצב רגיל כברירת מחדל
    switchMode('regular');
});
