// Состояние игры
let sequence = [];
let playerSequence = [];
let level = 0;
let isComputerPlaying = false;
let activeTimeouts = []; // Массив для отслеживания и очистки всех таймеров

// Получение элементов DOM
const levelDisplay = document.getElementById('level-display');
const statusMessage = document.getElementById('status-message');
const startBtn = document.getElementById('start-btn');
const tiles = document.querySelectorAll('.tile');

// Обработчики событий
startBtn.addEventListener('click', startGame);

tiles.forEach(tile => {
    tile.addEventListener('click', (e) => {
        if (isComputerPlaying) return; // Блокировка кликов во время показа последовательности
        
        const selectedIndex = parseInt(e.target.getAttribute('data-index'));
        handlePlayerTurn(selectedIndex);
    });
});

/**
 * Запуск новой игры
 */
function startGame() {
    resetGame();
    startBtn.disabled = true;
    nextRound();
}

/**
 * Сброс состояния игры и очистка таймеров
 */
function resetGame() {
    sequence = [];
    playerSequence = [];
    level = 0;
    isComputerPlaying = false;
    clearAllTimeouts();
    levelDisplay.textContent = level;
}

/**
 * Очистка всех активных таймеров (защита от "висящих" процессов)
 */
function clearAllTimeouts() {
    activeTimeouts.forEach(timerId => clearTimeout(timerId));
    activeTimeouts = [];
}

/**
 * Переход к следующему раунду
 */
function nextRound() {
    playerSequence = [];
    level++;
    levelDisplay.textContent = level;
    statusMessage.textContent = "Запомните последовательность...";
    
    // Добавляем случайный шаг (0 до 3) в последовательность компьютера
    const randomTile = Math.floor(Math.random() * 4);
    sequence.push(randomTile);

    playSequence();
}

/**
 * Воспроизведение последовательности компьютером с использованием setTimeout
 */
function playSequence() {
    isComputerPlaying = true;
    let delay = 600;

    sequence.forEach((tileIndex, index) => {
        const showTimer = setTimeout(() => {
            activateTile(tileIndex);
        }, delay * (index + 1));

        activeTimeouts.push(showTimer);
    });

    // Разблокировка ввода игрока после завершения показа
    const unlockTimer = setTimeout(() => {
        isComputerPlaying = false;
        statusMessage.textContent = "Ваша очередь повторять!";
    }, delay * (sequence.length + 1));

    activeTimeouts.push(unlockTimer);
}

/**
 * Кратковременная подсветка плитки
 */
function activateTile(index) {
    const tile = tiles[index];
    tile.classList.add('active');

    const hideTimer = setTimeout(() => {
        tile.classList.remove('active');
    }, 400); // Длительность подсветки 400мс

    activeTimeouts.push(hideTimer);
}

/**
 * Обработка клика игрока
 */
function handlePlayerTurn(selectedIndex) {
    playerSequence.push(selectedIndex);
    activateTile(selectedIndex);

    const currentIndex = playerSequence.length - 1;

    // Проверка правильности нажатия на каждом шаге
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver();
        return;
    }

    // Если игрок успешно завершил текущую последовательность
    if (playerSequence.length === sequence.length) {
        statusMessage.textContent = "Верно! Следующий уровень...";
        isComputerPlaying = true;

        const nextRoundTimer = setTimeout(() => {
            nextRound();
        }, 1000);

        activeTimeouts.push(nextRoundTimer);
    }
}

/**
 * Конец игры при ошибке
 */
function gameOver() {
    statusMessage.textContent = `Ошибка! Вы достигли уровня №${level}. Нажмите «Старт» заново.`;
    startBtn.disabled = false;
    isComputerPlaying = true;
    clearAllTimeouts(); // Корректно очищаем все запланированные таймеры[cite: 8]
}