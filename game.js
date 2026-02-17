// Данные игры
const questions = [
    {
        image: '../jungle.png',
        question: 'Дух леса Иччи спрашивает: Зачем ты спускаешься в Нижний мир, богатырь?',
        answers: [
            'Я иду защитить слабых и восстановить справедливость.',
            'Я хочу прославиться как великий воин!'
        ],
        correct: 0,
        explanation: 'Настоящий богатырь действует не ради славы, а ради защиты своего народа и справедливости.'
    },
    {
        image: '../urt.png',
        question: 'Странник предлагает тебе зелье забвения: выпей, и усталость уйдет, но ты забудешь о цели. Как поступит Боотур?',
        answers: [
            'Выпью зелье. Я слишком устал, пусть Туйаарыму спасет другой.',
            'Откажусь! Истинный боотур не ищет легких путей и не бросает друзей в беде.'
        ],
        correct: 1,
        explanation: 'Верность и стойкость — главные качества героя. Легкий путь часто ведет к предательству.'
    },
    {
        image: '../jungle.png',
        question: 'Ты встречаешь раненого врага. Он просит пощады. Что сделаешь?',
        answers: [
            'Добью его — враг есть враг!',
            'Окажу помощь. Милосердие к поверженному — признак силы.'
        ],
        correct: 1,
        explanation: 'Истинная сила богатыря проявляется в милосердии. Жестокость к беззащитному — признак слабости духа.'
    },
    {
        image: '../urt.png',
        question: 'Старуха у дороги просит помочь донести воду. Ты спешишь спасать Туйаарыму. Как поступишь?',
        answers: [
            'Помогу старушке. Добрые дела укрепляют дух героя.',
            'Извинюсь и пройду мимо — у меня важная миссия.'
        ],
        correct: 0,
        explanation: 'В эпосе Олонхо герой всегда помогает слабым. Часто за обликом старушки скрывается дух-покровитель.'
    },
    {
        image: '../hell.png',
        question: 'Абаасы предлагает поединок: бой на мечах или состязание в мудрости. Что выберешь?',
        answers: [
            'Бой на мечах — я сильнейший воин!',
            'Состязание в мудрости. Ум побеждает грубую силу.'
        ],
        correct: 1,
        explanation: 'Настоящий богатырь силен не только телом, но и разумом. Мудрость часто важнее физической силы.'
    },
    {
        image: '../jungle.png',
        question: 'Ты нашел волшебный артефакт, дающий огромную силу, но он принадлежит духам. Заберешь его?',
        answers: [
            'Нет, воровство у духов навлечет проклятие.',
            'Да, эта сила поможет мне победить!'
        ],
        correct: 0,
        explanation: 'Уважение к духам и их владениям — основа якутской культуры. Украденная сила принесет только беду.'
    },
    {
        image: '../hell.png',
        question: 'Абаасы рычит: "Я дам тебе горы золота, если ты уйдешь и оставишь девушку мне!" Что ты ответишь?',
        answers: [
            'Золото пригодится. Я согласен.',
            'Свобода народа дороже золота! Защищайся, чудовище!'
        ],
        correct: 1,
        explanation: 'Честь и верность своему слову важнее любых богатств. Нюргун Боотур никогда не предаст своих.'
    }
];

let currentQuestion = 0;
let score = 0;
let lives = 3;
let hintsUsed = 0;
const maxHints = 1;
let timeLeft = 12;
let timerInterval = null;
const bgMusic = document.getElementById('bg-music');

// Звуковые эффекты (создаем программно)
const soundEffects = {
    correct: () => playTone(800, 0.1, 'sine'),
    wrong: () => playTone(200, 0.2, 'sawtooth'),
    victory: () => playMelody([523, 659, 784, 1047], 0.15),
    defeat: () => playMelody([400, 350, 300, 250], 0.2)
};

function playTone(frequency, duration, type = 'sine') {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playMelody(frequencies, noteDuration) {
    frequencies.forEach((freq, index) => {
        setTimeout(() => playTone(freq, noteDuration), index * noteDuration * 1000);
    });
}

// Статистика игры
let gameStats = {
    gamesPlayed: 0,
    victories: 0,
    totalScore: 0,
    bestScore: 0
};

// Загрузка статистики
function loadStats() {
    const saved = localStorage.getItem('olonkhoStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
}

// Сохранение статистики
function saveStats() {
    localStorage.setItem('olonkhoStats', JSON.stringify(gameStats));
}

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
    lives = 3;
    hintsUsed = 0;
    loadStats();
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
    
    // Обновляем жизни
    updateLivesDisplay();
    
    // Обновляем кнопку подсказки
    updateHintButton();
    
    const buttons = document.querySelectorAll('.btn-answer');
    buttons[0].textContent = q.answers[0];
    buttons[1].textContent = q.answers[1];
    
    // Включаем кнопки обратно и убираем классы
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.classList.remove('correct', 'wrong');
    });
    
    // Запускаем таймер
    startTimer();
}

// Таймер
function startTimer() {
    timeLeft = 12;
    updateTimerDisplay();
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Автоматически выбираем неправильный ответ
            const q = questions[currentQuestion];
            selectAnswer(q.correct === 0 ? 1 : 0, true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `⏱ ${timeLeft}с`;
    
    if (timeLeft <= 5) {
        timerEl.classList.add('timer-warning');
    } else {
        timerEl.classList.remove('timer-warning');
    }
}

// Обновление жизней
function updateLivesDisplay() {
    const livesEl = document.getElementById('lives-display');
    livesEl.innerHTML = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
}

// Система подсказок
function useHint() {
    if (hintsUsed >= maxHints) return;
    
    const q = questions[currentQuestion];
    const buttons = document.querySelectorAll('.btn-answer');
    
    // Подсвечиваем правильный ответ на 2 секунды
    buttons[q.correct].style.boxShadow = '0 0 20px #f5d76e';
    
    hintsUsed++;
    updateHintButton();
    
    setTimeout(() => {
        buttons[q.correct].style.boxShadow = '';
    }, 2000);
}

function updateHintButton() {
    const hintBtn = document.getElementById('hint-btn');
    const remaining = maxHints - hintsUsed;
    hintBtn.textContent = remaining > 0 ? `💡 Подсказка` : `💡 Использована`;
    hintBtn.disabled = remaining <= 0;
}

// Выбор ответа
function selectAnswer(answerIndex, isTimeout = false) {
    const q = questions[currentQuestion];
    
    // Останавливаем таймер
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Убираем фокус с кнопки
    if (document.activeElement) document.activeElement.blur();
    
    // Отключаем все кнопки
    const buttons = document.querySelectorAll('.btn-answer');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });
    
    const isCorrect = answerIndex === q.correct;
    
    // Показываем правильный/неправильный ответ
    if (isCorrect) {
        buttons[answerIndex].classList.add('correct');
        score++;
        soundEffects.correct();
    } else {
        buttons[answerIndex].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
        lives--;
        updateLivesDisplay();
        soundEffects.wrong();
        
        // Эффект тряски экрана
        document.querySelector('.content').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.content').classList.remove('shake');
        }, 500);
    }
    
    // Показываем объяснение
    setTimeout(() => {
        showExplanation(q.explanation, isCorrect);
    }, 800);
}

// Показать объяснение
function showExplanation(text, isCorrect) {
    const explanationEl = document.getElementById('explanation');
    const explanationText = document.getElementById('explanation-text');
    const continueBtn = document.getElementById('continue-btn');
    
    explanationText.textContent = text;
    explanationEl.className = 'explanation ' + (isCorrect ? 'correct' : 'wrong');
    explanationEl.classList.add('show');
    continueBtn.style.display = 'block';
}

function hideExplanation() {
    const explanationEl = document.getElementById('explanation');
    const continueBtn = document.getElementById('continue-btn');
    explanationEl.classList.remove('show');
    continueBtn.style.display = 'none';
}

// Продолжить после объяснения
function continueGame() {
    hideExplanation();
    
    // Проверяем, закончились ли жизни
    if (lives <= 0) {
        setTimeout(() => {
            showResult();
        }, 300);
        return;
    }
    
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        setTimeout(() => {
            showQuestion();
        }, 300);
    } else {
        setTimeout(() => {
            showResult();
        }, 300);
    }
}

// Показать результат
function showResult() {
    // Останавливаем таймер если он еще работает
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const resultScreen = document.getElementById('result-screen');
    const resultImage = document.getElementById('result-image');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const scoreDisplay = document.getElementById('score-display');
    const restartBtn = document.querySelector('.btn-restart');
    
    // Обновляем статистику
    gameStats.gamesPlayed++;
    gameStats.totalScore += score;
    
    let resultType = '';
    
    // Концовки зависят от оставшихся жизней
    if (lives === 3) {
        resultType = 'perfect';
        resultScreen.classList.add('victory');
        resultScreen.classList.remove('defeat');
        resultImage.src = '../final.png';
        resultTitle.textContent = '🏆 ИДЕАЛЬНАЯ ПОБЕДА!';
        resultText.textContent = 'Ты прошел путь без единой ошибки! Твоя мудрость и честь достойны великих героев Олонхо!';
        gameStats.victories++;
        soundEffects.victory();
    } else if (lives === 2) {
        resultType = 'victory';
        resultScreen.classList.add('victory');
        resultScreen.classList.remove('defeat');
        resultImage.src = '../final.png';
        resultTitle.textContent = '⚔️ ПОБЕДА!';
        resultText.textContent = 'Твоя честь и храбрость спасли Туйаарыму Куо! Ты — настоящий герой Олонхо.';
        gameStats.victories++;
        soundEffects.victory();
    } else if (lives === 1) {
        resultType = 'partial';
        resultScreen.classList.add('victory');
        resultScreen.classList.remove('defeat');
        resultImage.src = '../final.png';
        resultTitle.textContent = '⚠️ ЧАСТИЧНЫЙ УСПЕХ';
        resultText.textContent = 'Ты проявил храбрость, но путь был труден. Туйаарыму спасена, но цена велика.';
        gameStats.victories++;
        soundEffects.victory();
    } else {
        resultType = 'defeat';
        resultScreen.classList.add('defeat');
        resultScreen.classList.remove('victory');
        resultImage.src = '../hell.png';
        resultTitle.textContent = '💀 ПОРАЖЕНИЕ';
        resultText.textContent = 'Твоя воля дрогнула... Нюргун не смог победить тьму. Попробуй пройти путь заново, как истинный герой.';
        soundEffects.defeat();
    }
    
    if (score > gameStats.bestScore) {
        gameStats.bestScore = score;
    }
    
    saveStats();
    
    scoreDisplay.innerHTML = `
        <div class="score-main">Баллов чести: ${score} из ${questions.length}</div>
        <div class="score-stats">
            <div>🎮 Игр сыграно: ${gameStats.gamesPlayed}</div>
            <div>🏆 Побед: ${gameStats.victories}</div>
            <div>⭐ Лучший результат: ${gameStats.bestScore}</div>
        </div>
    `;
    
    restartBtn.textContent = lives > 0 ? 'Играть снова' : 'Попробовать снова';
    
    showScreen('result-screen');
}

// Перезапуск игры
function restartGame() {
    startGame();
}

// Управление музыкой
function toggleMusic() {
    const musicBtn = document.getElementById('music-toggle');
    if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.textContent = '🔊';
    } else {
        bgMusic.pause();
        musicBtn.textContent = '🔇';
    }
}

// Поделиться результатом
function shareResult() {
    const text = `Я прошел "Путь Нюргуна Боотура" с результатом ${score} из ${questions.length}! 🏆`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Путь Нюргуна Боотура',
            text: text
        }).catch(() => {});
    } else {
        // Копируем в буфер обмена
        navigator.clipboard.writeText(text).then(() => {
            const shareBtn = document.getElementById('share-btn');
            const originalText = shareBtn.textContent;
            shareBtn.textContent = '✅ Скопировано!';
            setTimeout(() => {
                shareBtn.textContent = originalText;
            }, 2000);
        });
    }
}

// Показать справку об Олонхо
function showGlossary() {
    showScreen('glossary-screen');
}

function closeGlossary() {
    showScreen('welcome-screen');
}

// Инициализация при загрузке
window.addEventListener('load', () => {
    preloadImages();
    loadStats();
});
