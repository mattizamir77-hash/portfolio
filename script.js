// Vibe Coding JavaScript: הפעלת/השהיית וידאו במעבר עכבר + קליק
const cards = document.querySelectorAll('.project-card');

cards.forEach(card => {
    const video = card.querySelector('.project-video');

    // 1. אירוע כניסת העכבר (Hover In)
    card.addEventListener('mouseenter', () => {
        video.currentTime = 0; 
        video.play().catch(error => {
            console.warn("הפעלת Hover נחסמה. נסה ללחוץ.");
        });
    });

    // 2. אירוע יציאת העכבר (Hover Out)
    card.addEventListener('mouseleave', () => {
        video.pause();
    });

    // 3. תיקון קליק: מאפשר למשתמש ללחוץ אם ה-Hover נחסם
    card.addEventListener('click', () => {
        if (video.paused) {
            video.currentTime = 0; 
            video.play();
        } else {
            video.pause();
        }
    });
});
