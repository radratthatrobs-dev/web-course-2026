export function renderCategories(categories, selectElement, filterSelectElement = null) {
    let filterOptionsHtml = '<option value="">Все категории</option>';
    let formOptionsHtml = '';

    categories.forEach(cat => {
        const typeLabel = cat.type === 'income' ? 'Доход' : 'Расход';
        formOptionsHtml += `<option value="${cat.id}" data-type="${cat.type}">${cat.name} (${typeLabel})</option>`;
        filterOptionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
    });

    selectElement.innerHTML = formOptionsHtml;
    if (filterSelectElement) {
        filterSelectElement.innerHTML = filterOptionsHtml;
    }
}

export function renderTransactions(transactions, containerElement, editingId = null) {
    if (transactions.length === 0) {
        containerElement.innerHTML = '<li style="text-align: center; color: #777;">Нет операций</li>';
        return;
    }

    containerElement.innerHTML = transactions.map(t => {
        const isIncome = t.category_type === 'income';
        const sign = isIncome ? '+' : '-';
        const colorClass = isIncome ? 'income' : 'expense';
        const editingClass = Number(editingId) === Number(t.id) ? 'editing' : '';

        return `
            <li class="transaction-item ${editingClass}">
                <div class="transaction-info">
                    <strong>${t.category_name}</strong>
                    <span class="transaction-meta">${t.date}${t.comment ? ' — ' + t.comment : ''}</span>
                </div>
                <div class="transaction-actions">
                    <span class="transaction-amount ${colorClass}">${sign}${Number(t.amount).toFixed(2)} ₽</span>
                    <button type="button" class="edit-btn" data-id="${t.id}">Редактировать</button>
                    <button type="button" class="delete-btn" data-id="${t.id}">Удалить</button>
                </div>
            </li>
        `;
    }).join('');
}

export function renderSummary(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amt = Number(t.amount);
        if (t.category_type === 'income') {
            income += amt;
        } else {
            expense += amt;
        }
    });

    const balance = income - expense;

    document.getElementById('totalIncome').textContent = `${income.toFixed(2)} ₽`;
    document.getElementById('totalExpense').textContent = `${expense.toFixed(2)} ₽`;

    const balanceEl = document.getElementById('balance');
    balanceEl.textContent = `${balance.toFixed(2)} ₽`;
    balanceEl.className = balance >= 0 ? 'income' : 'expense';
}