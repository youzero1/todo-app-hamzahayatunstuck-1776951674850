'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '@/types';
import { getSupabaseClient } from '@/lib/supabase';
import TodoItem from '@/components/TodoItem';

type FilterType = 'all' | 'active' | 'completed';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchTodos = useCallback(async () => {
    if (!supabase) {
      setSupabaseAvailable(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setConnectionError(null);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error.message);
      setConnectionError(error.message);
    } else {
      setTodos((data as Todo[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    if (!supabase) {
      // Local-only fallback
      const localTodo: Todo = {
        id: crypto.randomUUID(),
        title: trimmed,
        completed: false,
        created_at: new Date().toISOString(),
      };
      setTodos((prev) => [localTodo, ...prev]);
      setNewTitle('');
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({ title: trimmed, completed: false })
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error.message);
      setConnectionError(error.message);
    } else if (data) {
      setTodos((prev) => [data as Todo, ...prev]);
      setConnectionError(null);
    }
    setNewTitle('');
  }

  async function handleToggle(id: string, completed: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );

    if (supabase) {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);
      if (error) console.error('Error toggling todo:', error.message);
    }
  }

  async function handleDelete(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));

    if (supabase) {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) console.error('Error deleting todo:', error.message);
    }
  }

  async function handleEdit(id: string, title: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );

    if (supabase) {
      const { error } = await supabase
        .from('todos')
        .update({ title })
        .eq('id', id);
      if (error) console.error('Error editing todo:', error.message);
    }
  }

  async function handleClearCompleted() {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    setTodos((prev) => prev.filter((t) => !t.completed));

    if (supabase && completedIds.length > 0) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .in('id', completedIds);
      if (error) console.error('Error clearing completed:', error.message);
    }
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          ✅ Todo App
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Stay organized. Get things done.
        </p>
        {supabaseAvailable && !connectionError && (
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            🟢 Connected to Supabase
          </p>
        )}
      </div>

      {!supabaseAvailable && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Supabase not configured.</strong> Todos are stored in local
          state only and will be lost on refresh. Set{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{' '}
          and{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{' '}
          to persist data.
        </div>
      )}

      {connectionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Database error:</strong> {connectionError}
          <p className="mt-1 text-xs text-red-600">
            Make sure the <code className="font-mono">todos</code> table exists. Run the migration SQL in
            Supabase SQL Editor or via Summon&apos;s Database panel.
          </p>
          <button
            onClick={fetchTodos}
            className="mt-2 rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTitle(e.target.value)
          }
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Add
        </button>
      </form>

      {/* Filters */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex gap-1">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 capitalize transition-colors ${
                filter === f
                  ? 'bg-indigo-100 font-medium text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-gray-400">
          {activeCount} item{activeCount !== 1 ? 's' : ''} left
        </span>
      </div>

      {/* Todo list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-300">
            {filter === 'all'
              ? 'No todos yet. Add one above!'
              : filter === 'active'
              ? 'No active todos. Nice work!'
              : 'No completed todos yet.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </ul>
      )}

      {/* Footer */}
      {completedCount > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleClearCompleted}
            className="text-sm text-red-500 transition-colors hover:text-red-700 hover:underline"
          >
            Clear {completedCount} completed item{completedCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
