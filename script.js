// Vibe Coding JavaScript: הפעלת/השהיית וידאו במעבר עכבר
const cards = document.querySelectorAll('.project-card');

cards.forEach(card => {
    const video = card.querySelector('.project-video');

    // 1. אירוע כניסת העכבר (Hover In)
    card.addEventListener('mouseenter', () => {
        // מתחיל את הוידאו מהתחלה ומנגן
        video.currentTime = 0; 
        video.play().catch(error => {
            console.error("שגיאה בהפעלת וידאו אוטומטית:", error);
        });
    });

    // 2. אירוע יציאת העכבר (Hover Out)
    card.addEventListener('mouseleave', () => {
        // עוצר את הניגון
        video.pause();
    });
});
