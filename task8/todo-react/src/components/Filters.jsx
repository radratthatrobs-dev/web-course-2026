import React from 'react';

/**
 * @param {{
 *   filterOptions: Array<{ id: string, label: string }>,
 *   currentFilter: string,
 *   onFilterChange: (filterId: string) => void,
 *   sortOptions: Array<{ id: string, label: string }>,
 *   currentSort: string,
 *   onSortChange: (sortId: string) => void
 * }} props
 */
export const Filters = React.memo(function Filters({
  filterOptions,
  currentFilter,
  onFilterChange,
  sortOptions,
  currentSort,
  onSortChange,
}) {
  return (
    <div className="controls-panel">
      <div className="filters-group" role="group" aria-label="Фильтр задач">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`filter-btn ${currentFilter === option.id ? 'active' : ''}`}
            onClick={() => onFilterChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <select
        className="sort-select"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Сортировка задач"
      >
        {sortOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});