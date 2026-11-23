import React from 'react';

/**
 * @param {{
 *   task: { id: number, text: string, completed: boolean, createdAt: number },
 *   onToggle: (id: number) => void,
 *   onDelete: (id: number) => void
 * }} props
 */
export const TodoItem = React.memo(function TodoItem({ task, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      <div className="todo-content" onClick={() => onToggle(task.id)}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => {}}
          aria-label={`Отметить "${task.text}"`}
        />
        <span className="todo-text">{task.text}</span>
      </div>

      <button
        type="button"
        className="delete-btn"
        onClick={() => onDelete(task.id)}
      >
        Удалить
      </button>
    </li>
  );
});