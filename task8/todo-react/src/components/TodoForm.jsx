import React, { useState } from 'react';

/**
 * @param {{ onAdd: (text: string, completed: boolean) => void }} props
 */
export function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Введите текст задачи');
      return;
    }
    setError('');
    onAdd(trimmed, completed);
    setText('');
    setCompleted(false);
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Новая задача..."
          aria-label="Текст новой задачи"
        />
        <button type="submit">Добавить</button>
      </div>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
        />
        <span>Создать сразу выполненной</span>
      </label>

      {error && <p className="error-msg">{error}</p>}
    </form>
  );
}