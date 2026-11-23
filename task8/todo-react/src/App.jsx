import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TodoForm } from './components/TodoForm';
import { Filters } from './components/Filters';
import { TodoList } from './components/TodoList';
import { Stats } from './components/Stats';

const STORAGE_KEY = 'todo_react_mvc_tasks_v1';

const FILTER_CONFIG = [
  { id: 'all', label: 'Все', predicate: () => true },
  { id: 'active', label: 'Активные', predicate: (task) => !task.completed },
  { id: 'completed', label: 'Завершённые', predicate: (task) => task.completed },
];

const SORT_CONFIG = [
  {
    id: 'newest',
    label: 'Сначала новые',
    compare: (a, b) => b.createdAt - a.createdAt,
  },
  {
    id: 'oldest',
    label: 'Сначала старые',
    compare: (a, b) => a.createdAt - b.createdAt,
  },
  {
    id: 'alpha-asc',
    label: 'По алфавиту (А → Я)',
    compare: (a, b) => a.text.localeCompare(b.text, 'ru'),
  },
  {
    id: 'alpha-desc',
    label: 'По алфавиту (Я → А)',
    compare: (a, b) => b.text.localeCompare(a.text, 'ru'),
  },
];

const DEFAULT_TASKS = [
];

function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

export function App() {
  const [tasks, setTasks] = useState(loadTasksFromStorage);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Не удалось сохранить задачи в localStorage:', error);
    }
  }, [tasks]);

  const handleAdd = useCallback((text, completed) => {
    const newTask = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text,
      completed,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleToggle = useCallback((id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const visibleTasks = useMemo(() => {
    const activeFilter = FILTER_CONFIG.find((item) => item.id === filter) || FILTER_CONFIG[0];
    const activeSort = SORT_CONFIG.find((item) => item.id === sortBy) || SORT_CONFIG[0];

    const filtered = tasks.filter(activeFilter.predicate);
    return [...filtered].sort(activeSort.compare);
  }, [tasks, filter, sortBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [tasks]);

  return (
    <main className="app-container">
      <h1>Todo-list (React MVC)</h1>

      <TodoForm onAdd={handleAdd} />

      <Filters
        filterOptions={FILTER_CONFIG}
        currentFilter={filter}
        onFilterChange={setFilter}
        sortOptions={SORT_CONFIG}
        currentSort={sortBy}
        onSortChange={setSortBy}
      />

      <TodoList
        tasks={visibleTasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      <Stats
        total={stats.total}
        active={stats.active}
        completed={stats.completed}
      />
    </main>
  );
}

export default App;