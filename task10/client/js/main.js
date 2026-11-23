import {
    apiGetCategories,
    apiCreateCategory,
    apiGetTransactions,
    apiCreateTransaction,
    apiUpdateTransaction,
    apiDeleteTransaction
} from './api.js';
import { renderCategories, renderTransactions, renderSummary } from './ui.js';

const FILTERS_STORAGE_KEY = 'zen_money_filters_v1';

document.addEventListener('DOMContentLoaded', async () => {
    const transactionForm = document.getElementById('transactionForm');
    const formTitle = document.getElementById('formTitle');
    const amountInput = document.getElementById('amountInput');
    const categorySelect = document.getElementById('categorySelect');
    const typeSelect = document.getElementById('typeSelect');
    const dateInput = document.getElementById('dateInput');
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const transactionsList = document.getElementById('transactionsList');

    const categoryForm = document.getElementById('categoryForm');
    const catNameInput = document.getElementById('catNameInput');
    const catTypeSelect = document.getElementById('catTypeSelect');

    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    let categories = [];
    let currentTransactions = [];
    let editingTransactionId = null;

    // Приоритет типа операции по выбранной категории
    function syncTypeWithCategory() {
        const selectedCatId = Number(categorySelect.value);
        const selectedCategory = categories.find(c => Number(c.id) === selectedCatId);
        if (selectedCategory) {
            typeSelect.value = selectedCategory.type;
        }
    }

    function resetTransactionForm() {
        editingTransactionId = null;
        transactionForm.reset();
        dateInput.valueAsDate = new Date();
        formTitle.textContent = 'Новая операция';
        submitBtn.textContent = 'Добавить операцию';
        cancelEditBtn.classList.add('hidden');
        syncTypeWithCategory();
        renderTransactions(currentTransactions, transactionsList, null);
    }

    function startEditTransaction(transaction) {
        editingTransactionId = transaction.id;
        amountInput.value = transaction.amount;
        categorySelect.value = transaction.category_id;
        syncTypeWithCategory();
        dateInput.value = transaction.date;
        commentInput.value = transaction.comment || '';

        formTitle.textContent = `Редактирование операции #${transaction.id}`;
        submitBtn.textContent = 'Сохранить изменения';
        cancelEditBtn.classList.remove('hidden');

        renderTransactions(currentTransactions, transactionsList, editingTransactionId);
        transactionForm.scrollIntoView({ behavior: 'smooth' });
    }

    function loadSavedFilters() {
        try {
            const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved.type) filterType.value = saved.type;
            if (saved.category_id) filterCategory.value = saved.category_id;
            if (saved.from) filterFrom.value = saved.from;
            if (saved.to) filterTo.value = saved.to;
        } catch (e) {
            console.error('Ошибка чтения настроек фильтров:', e);
        }
    }

    function saveFilters(filters) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    }

    async function loadCategoriesAndSync() {
        try {
            categories = await apiGetCategories();
            const prevSelectedCat = categorySelect.value;
            const prevFilterCat = filterCategory.value;

            renderCategories(categories, categorySelect, filterCategory);

            if (prevSelectedCat && categories.some(c => String(c.id) === prevSelectedCat)) {
                categorySelect.value = prevSelectedCat;
            }
            if (prevFilterCat && categories.some(c => String(c.id) === prevFilterCat)) {
                filterCategory.value = prevFilterCat;
            }
            syncTypeWithCategory();
        } catch (error) {
            alert(error.message);
        }
    }

    async function updateData() {
        const filters = {
            type: filterType.value,
            category_id: filterCategory.value,
            from: filterFrom.value,
            to: filterTo.value
        };
        saveFilters(filters);

        try {
            currentTransactions = await apiGetTransactions(filters);
            renderTransactions(currentTransactions, transactionsList, editingTransactionId);
            renderSummary(currentTransactions);
        } catch (error) {
            alert(error.message);
        }
    }

    // Инициализация
    dateInput.valueAsDate = new Date();
    await loadCategoriesAndSync();
    loadSavedFilters();
    await updateData();

    // При смене категории автоматически обновляется тип операции
    categorySelect.addEventListener('change', syncTypeWithCategory);

    // Отмена редактирования
    cancelEditBtn.addEventListener('click', resetTransactionForm);

    // Создание или обновление операции (POST / PUT)
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amount = parseFloat(amountInput.value);
        const category_id = parseInt(categorySelect.value, 10);
        const date = dateInput.value;
        const comment = commentInput.value.trim();

        if (Number.isNaN(amount) || amount <= 0) {
            alert('Введите корректную сумму больше 0');
            return;
        }
        if (!category_id || !date) {
            alert('Выберите категорию и дату');
            return;
        }

        try {
            const payload = { amount, category_id, date, comment };

            if (editingTransactionId !== null) {
                await apiUpdateTransaction(editingTransactionId, payload);
            } else {
                await apiCreateTransaction(payload);
            }

            resetTransactionForm();
            await updateData();
        } catch (error) {
            alert(error.message);
        }
    });

    // Создание новой категории
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = catNameInput.value.trim();
        const type = catTypeSelect.value;

        if (!name) {
            alert('Введите название категории');
            return;
        }

        try {
            const created = await apiCreateCategory({ name, type });
            catNameInput.value = '';
            await loadCategoriesAndSync();
            categorySelect.value = created.id;
            syncTypeWithCategory();
        } catch (error) {
            alert(error.message);
        }
    });

    // Кнопки "Редактировать" и "Удалить" в списке операций
    transactionsList.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const id = Number(editBtn.dataset.id);
            const target = currentTransactions.find(t => Number(t.id) === id);
            if (target) {
                startEditTransaction(target);
            }
            return;
        }

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = Number(deleteBtn.dataset.id);
            try {
                await apiDeleteTransaction(id);
                if (editingTransactionId === id) {
                    resetTransactionForm();
                }
                await updateData();
            } catch (error) {
                alert(error.message);
            }
        }
    });

    // Фильтры (запросы на сервер)
    filterType.addEventListener('change', updateData);
    filterCategory.addEventListener('change', updateData);
    filterFrom.addEventListener('change', updateData);
    filterTo.addEventListener('change', updateData);

    resetFiltersBtn.addEventListener('click', () => {
        filterType.value = '';
        filterCategory.value = '';
        filterFrom.value = '';
        filterTo.value = '';
        updateData();
    });
});