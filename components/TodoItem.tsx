'use client';

import { useState } from 'react';
import type { Todo } from '@/types';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  function handleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    } else {
      setEditTitle(todo.title);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditTitle(todo.title);
      setIsEditing(false);
    }
  }

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md">
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-gray-300 hover:border-emerald-400'
        }`}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 rounded border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 cursor-pointer text-sm select-none ${
            todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          {todo.title}
        </span>
      )}

      <button
        onClick={() => onDelete(todo.id)}
        className="ml-auto flex-shrink-0 rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        aria-label="Delete todo"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}
