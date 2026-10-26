// Состояние приложения
let secretDigits = [];
let attemptsHistory = [];
let isGameOver = false;

// Получение элементов DOM
const userInput = document.getElementById('user-input');
const checkBtn = document.getElementById('check-btn');
const restartBtn = document.getElementById('restart-btn');
const errorMessage = document.getElementById('error-message');
const winMessage = document.getElementById('win-message');
const attemptsCountSpan = document.getElementById('attempts-count');
const historyList = document.getElementById('history-list');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', startNewGame);

checkBtn.addEventListener('click', handleCheckGuess);
restartBtn.addEventListener('click', startNewGame);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleCheckGuess();
    }
});

/**
 * 1. Функция генерации случайного 4-значного числа с неповторяющимися цифрами
 */
function generateSecretNumber() {
    let digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // Перемешиваем массив случайным образом
    digits.sort(() => Math.random() - 0.5);
    // Гарантируем, что первая цифра не ноль, чтобы число выглядело корректно
    if (digits[0] === '0') {
        let nonZeroIndex = digits.findIndex(d => d !== '0');
        let temp = digits[0];
        digits[0] = digits[nonZeroIndex];
        digits[nonZeroIndex] = temp;
    }
    // Возвращаем первые 4 цифры в виде массива
    return digits.slice(0, 4);
}

/**
 * 2. Функция валидации ввода игрока
 */
function validateInput(inputStr) {
    if (inputStr.length !== 4) {
        return "Введите ровно 4 цифры.";
    }
    if (!/^\d{4}$/.test(inputStr)) {
        return "Разрешены только цифры.";
    }
    // Проверка на уникальность цифр
    let uniqueSet = new Set(inputStr);
    if (uniqueSet.size !== 4) {
        return "Цифры не должны повторяться.";
    }
    return null; // Ошибок нет
}

/**
 * 3. Функция подсчёта быков и коров
 */
function countBullsAndCows(secret, guessArray) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
        if (guessArray[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guessArray[i])) {
            cows++;
        }
    }
    return { bulls, cows };
}

/**
 * Обработчик проверки попытки игрока
 */
function handleCheckGuess() {
    if (isGameOver) return;

    const guessText = userInput.value.trim();
    errorMessage.textContent = '';

    // Валидация
    const error = validateInput(guessText);
    if (error) {
        errorMessage.textContent = error;
        return; // Попытка не засчитывается
    }

    const guessArray = guessText.split('');
    const { bulls, cows } = countBullsAndCows(secretDigits, guessArray);

    // Добавление попытки в массив состояния
    attemptsHistory.push({
        guess: guessText,
        bulls: bulls,
        cows: cows
    });

    userInput.value = '';
    render();

    // Проверка на победу
    if (bulls === 4) {
        isGameOver = true;
        winMessage.textContent = `Победа! Угадано за ${attemptsHistory.length} попыток.`;
        userInput.disabled = true;
        checkBtn.disabled = true;
    }
}

/**
 * Функция сброса состояния и начала новой игры
 */
function startNewGame() {
    secretDigits = generateSecretNumber();
    attemptsHistory = [];
    isGameOver = false;
    userInput.value = '';
    userInput.disabled = false;
    checkBtn.disabled = false;
    errorMessage.textContent = '';
    winMessage.textContent = '';
    render();
    console.log("Загаданное число (для отладки):", secretDigits.join(''));
}

/**
 * Функция рендеринга интерфейса на основе массива истории
 */
function render() {
    historyList.innerHTML = '';

    // Отрисовка истории с помощью метода массива
    attemptsHistory.forEach((attempt, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        // Форматирование вывода под требования: "1234 — 1 бык, 2 коровы"
        li.innerHTML = `
            <span><strong>#${index + 1}:</strong> ${attempt.guess}</span>
            <span>${attempt.bulls} бык(а), ${attempt.cows} коров(ы)</span>
        `;
        historyList.appendChild(li);
    });

    attemptsCountSpan.textContent = attemptsHistory.length;
}