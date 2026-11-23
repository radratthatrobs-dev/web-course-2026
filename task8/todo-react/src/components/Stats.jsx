import React from 'react';

/**
 * @param {{ total: number, active: number, completed: number }} props
 */
export const Stats = React.memo(function Stats({ total, active, completed }) {
  return (
    <div className="stats-panel">
      Всего: <strong>{total}</strong>, Осталось: <strong>{active}</strong>, Выполнено:{' '}
      <strong>{completed}</strong>
    </div>
  );
});