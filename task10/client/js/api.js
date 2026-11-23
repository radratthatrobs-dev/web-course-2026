const API_URL = 'http://localhost:3001';

export async function apiGetCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Ошибка загрузки категорий');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function apiGetTransactions(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);

        const res = await fetch(`${API_URL}/transactions?${params.toString()}`);
        if (!res.ok) throw new Error('Ошибка загрузки транзакций');
        return await res.json();
    } catch (error) {
        console.error(error);
        alert('Не удалось подключиться к серверу');
        return [];
    }
}

export async function apiCreateTransaction(data) {
    const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка создания транзакции');
    }
    return await res.json();
}

export async function apiUpdateTransaction(id, data) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка обновления транзакции');
    }
    return await res.json();
}

export async function apiDeleteTransaction(id) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Ошибка удаления транзакции');
    return await res.json();
}

export async function apiCreateCategory(data) {
    const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка создания категории');
    }
    return await res.json();
}