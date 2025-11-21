/* Vibe Coding CSS: עיצוב נקי ומודרני */
body {
    background-color: #f4f7f6;
    font-family: 'Arial', sans-serif;
    color: #333;
    line-height: 1.6;
    margin: 0;
    padding: 0;
}

header {
    text-align: center;
    padding: 40px 20px 20px;
    background-color: #ffffff;
    border-bottom: 2px solid #e0e0e0;
}

h1 {
    color: #1a73e8;
    margin: 0;
}

.portfolio-grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 30px;
    padding: 50px 20px;
}

/* כרטיס הפרויקט (המיכל הראשי) */
.project-card {
    position: relative;
    overflow: hidden; 
    width: 300px;
    height: 200px;
    cursor: pointer;
    border-radius: 12px; 
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); 
    transition: transform 0.3s ease;
}

.project-card:hover {
    transform: translateY(-5px); 
}

/* אלמנט הוידאו - מוסתר בהתחלה */
.project-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; 
    opacity: 0; 
    transition: opacity 0.4s ease; 
}

/* שכבת התוכן - יושבת מעל הוידאו */
.project-info {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.85); 
    color: white;
    padding: 15px;
    box-sizing: border-box;
    transition: background-color 0.4s ease;
    z-index: 10; 
}

.project-info h3 {
    margin-top: 0;
    font-size: 1.2em;
}

.project-info p {
    font-size: 0.9em;
}

/* *** אפקט ה-Hover: מופיע הוידאו ושכבת הטקסט נהיית שקופה יותר *** */
.project-card:hover .project-video {
    opacity: 1; 
}

.project-card:hover .project-info {
    background-color: rgba(0, 0, 0, 0.4); 
}
