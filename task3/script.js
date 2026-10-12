// Массив объектов для хранения состояния приложения
let tasks = [];
let currentFilter = 'all'; // Возможные значения: 'all', 'active', 'completed'

// Получаем элементы из DOM
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const counterActive = document.getElementById('counter-active');
const counterCompleted = document.getElementById('counter-completed');

// Обработка событий через addEventListener (без onclick в HTML)
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Навешиваем события на кнопки переключения фильтров
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        render();
    });
});

// Функция добавления новой задачи
function addTask() {
    const text = taskInput.value.trim();

    // Проверка на пустой ввод (если поле пустое, задача не добавляется)
    if (text === '') {
        alert('Поле ввода не может быть пустым!');
        return;
    }

    const newTask = {
        id: Date.now(), // Уникальный идентификатор задачи
        text: text,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = ''; // Очищаем поле ввода
    render();
}

// Функция удаления задачи по её уникальному ID
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    render();
}

// Функция переключения статуса выполнения (completed: true/false)
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    render();
}

// Главная функция рендеринга интерфейса на основе актуальных данных массива
function render() {
    // Очищаем текущий список перед перерисовкой
    taskList.innerHTML = '';

    // Фильтрация задач с использованием метода filter[cite: 4]
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // для фильтра 'all'
    });

    // Динамическая генерация HTML-разметки для каждой задачи[cite: 4]
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text"></span>
            </div>
            <button class="delete-btn">Удалить</button>
        `;

        // Безопасная вставка текста задачи во избежание XSS
        li.querySelector('.task-text').textContent = task.text;

        // Добавление обработчиков событий для элементов внутри динамически созданной строки
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(li);
    });

    // Подсчет количества активных и выполненных задач
    const activeCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;

    counterActive.textContent = `Осталось: ${activeCount}`;
    counterCompleted.textContent = `Выполнено: ${completedCount}`;
}