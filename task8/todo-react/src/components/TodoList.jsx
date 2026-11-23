import React from 'react';
import { TodoItem } from './TodoItem';

/**
 * @param {{
 *   tasks: Array<{ id: number, text: string, completed: boolean, createdAt: number }>,
 *   onToggle: (id: number) => void,
 *   onDelete: (id: number) => void
 * }} props
 */
export const TodoList = React.memo(function TodoList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty-state">Задач по выбранному условию нет</p>;
  }

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
});