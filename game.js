// Данные игры
const questions = [
    {
        image: '../jungle.png',
        question: 'Дух леса Иччи спрашивает: Зачем ты спускаешься в Нижний мир, богатырь?',
        answers: [
            'Я хочу прославиться как великий воин!',
            'Я иду защитить слабых и восстановить справедливость.'
        ],
        correct: 1
    },
    {
        image: '../urt.png',
        question: 'Странник предлагает тебе зелье забвения: выпей, и усталость уйдет, но ты забудешь о цели. Как поступит Боотур?',
        answers: [
            'Выпью зелье. Я слишком устал, пусть Туйаарыму спасет другой.',
            'Откажусь! Истинный боотур не ищет легких путей и не бросает друзей в беде.'
        ],
        correct: 1
    },
    {
        image: '../hell.png',
        question: 'Абаасы рычит: "Я дам тебе горы золота, если ты уйдешь и оставишь девушку мне!" Что ты ответишь?',
        answers: [
            'Золото пригодится. Я согласен.',
            'Свобода народа дороже золота! Защищайся, чудовище!'
        ],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;
const bgMusic = document.getElementById('bg-music');

// Предзагрузка всех картинок
const imageCache = [];
function preloadImages() {
    const imagesToLoad = [
        ...questions.map(q => q.image),
        '../final.png',
        '../hell.png'
    ];
    
    imagesToLoad.forEach(src => {
        const img = new Image();
        img.src = src;
        imageCache.push(img);
    });
}

// Предзагружаем картинки при загрузке страницы
window.addEventListener('load', preloadImages);

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
    }, 100);
}

// Начало игры
function startGame() {
    // Запуск музыки
    bgMusic.play().catch(e => console.log('Автовоспроизведение заблокировано'));
    
    currentQuestion = 0;
    score = 0;
    showQuestion();
    showScreen('question-screen');
}

// Показать вопрос
function showQuestion() {
    const q = questions[currentQuestion];
    document.getElementById('scene-image').src = q.image;
    document.getElementById('question-text').textContent = q.question;
    
    // Обновляем счетчик и прогресс
    document.getElementById('question-counter').textContent = `Вопрос ${currentQuestion + 1} из ${questions.length}`;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    const buttons = document.querySelectorAll('.btn-answer');
    buttons[0].textContent = q.answers[0];
    buttons[1].textContent = q.answers[1];
    
    // Включаем кнопки обратно и убираем классы
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.classList.remove('correct', 'wrong');
    });
}

// Выбор ответа
function selectAnswer(answerIndex) {
    const q = questions[currentQuestion];
    
    // Убираем фокус с кнопки
    document.activeElement.blur();
    
    // Отключаем все кнопки
    const buttons = document.querySelectorAll('.btn-answer');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });
    
    // Показываем правильный/неправильный ответ
    if (answerIndex === q.correct) {
        buttons[answerIndex].classList.add('correct');
        score++;
    } else {
        buttons[answerIndex].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
    }
    
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        setTimeout(() => {
            showQuestion();
        }, 1000);
    } else {
        setTimeout(() => {
            showResult();
        }, 1000);
    }
}

// Показать результат
function showResult() {
    const resultScreen = document.getElementById('result-screen');
    const resultImage = document.getElementById('result-image');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const scoreDisplay = document.getElementById('score-display');
    const restartBtn = document.querySelector('.btn-restart');
    
    scoreDisplay.textContent = `Баллов чести: ${score} из ${questions.length}`;
    
    if (score === 3) {
        resultScreen.classList.add('victory');
        resultScreen.classList.remove('defeat');
        resultImage.src = '../final.png';
        resultTitle.textContent = 'ПОБЕДА!';
        resultText.textContent = 'Твоя честь и храбрость спасли Туйаарыму Куо! Ты — настоящий герой Олонхо.';
        restartBtn.textContent = 'Играть снова';
    } else {
        resultScreen.classList.add('defeat');
        resultScreen.classList.remove('victory');
        resultImage.src = '../hell.png';
        resultTitle.textContent = 'Твоя воля дрогнула...';
        resultText.textContent = 'Нюргун не смог победить тьму. Попробуй пройти путь заново, как истинный герой.';
        restartBtn.textContent = 'Попробовать снова';
    }
    
    showScreen('result-screen');
}

// Перезапуск игры
function restartGame() {
    startGame();
}
