document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרות בסיס
    const mainCard = document.getElementById('mainProjectCard');
    const mainVideo = mainCard ? mainCard.querySelector('.project-video') : null;
    
    if (!mainCard || !mainVideo) {
        console.error("Initialization failed: Main elements not found.");
        return;
    }
    
    // 2. לוגיקה לטיפול בהפעלה/השהייה
    function handlePlayback() {
        // אם הסרטון מושהה, הפעל
        if (mainVideo.paused) {
             mainVideo.play().catch(error => {
                console.error("Autoplay failed:", error); // הדפדפן חסם את ה-Play
            });
        } else {
            // אם הסרטון מנגן, עצור
            mainVideo.pause();
            mainVideo.currentTime = 0; // חזור להתחלה
        }
    }
    
    // 3. הצמדת אירועים
    mainCard.addEventListener('mouseenter', () => {
        // הפעלת הוידאו במעבר עכבר
        if (mainVideo.paused) {
            handlePlayback();
        }
    });
    
    mainCard.addEventListener('mouseleave', () => {
        // עצירת הוידאו ביציאה
        if (!mainVideo.paused) {
            handlePlayback();
        }
    });

    // מאתחל את הוידאו כדי לוודא שהוא מוכן
    mainVideo.load();
});
