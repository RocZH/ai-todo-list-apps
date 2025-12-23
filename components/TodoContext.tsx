import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Define types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string; // Supabase returns dates as strings
  ai_generated?: boolean;
}

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'TOGGLE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'EDIT_TODO'; payload: Todo }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TodoState = {
  todos: [],
  loading: true,
  error: null,
};

// Reducer function
const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...action.payload }
            : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      };
    case 'EDIT_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...action.payload }
            : todo
        ),
      };
    case 'SET_TODOS':
      return {
        ...state,
        todos: action.payload,
        loading: false,
      };
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Create context
interface TodoContextType {
  state: TodoState;
  addTodo: (text: string, aiGenerated?: boolean) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  editTodo: (id: string, text: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

// Provider component
interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Load todos from Supabase on component mount
  useEffect(() => {
    loadTodos();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          dispatch({ type: 'ADD_TODO', payload: payload.new as Todo });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          dispatch({ type: 'TOGGLE_TODO', payload: payload.new as Todo });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          dispatch({ type: 'DELETE_TODO', payload: { id: payload.old.id } });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper function to handle errors consistently
  const handleError = (error: any, operation: string) => {
    const errorMessage = error?.message || `Failed to ${operation}`;
    console.error(`Error ${operation}:`, error);
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  };

  const loadTodos = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      dispatch({ type: 'SET_TODOS', payload: data || [] });
    } catch (error: any) {
      handleError(error, 'load todos');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addTodo = async (text: string, aiGenerated: boolean = false) => {
    if (!text.trim()) return;

    try {
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
            text: text.trim(),
            completed: false,
            ai_generated: aiGenerated,
            created_at: timestamp,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      dispatch({ type: 'ADD_TODO', payload: data as Todo });
    } catch (error: any) {
      handleError(error, 'add todo');
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = state.todos.find(todo => todo.id === id);
    if (!todo) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      dispatch({ type: 'TOGGLE_TODO', payload: data as Todo });
    } catch (error: any) {
      handleError(error, 'toggle todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      dispatch({ type: 'DELETE_TODO', payload: { id } });
    } catch (error: any) {
      handleError(error, 'delete todo');
    }
  };

  const editTodo = async (id: string, text: string) => {
    if (!text.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ text: text.trim() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      dispatch({ type: 'EDIT_TODO', payload: data as Todo });
    } catch (error: any) {
      handleError(error, 'edit todo');
    }
  };

  const clearCompleted = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('completed', true);

      if (error) {
        throw error;
      }

      dispatch({ type: 'CLEAR_COMPLETED' });
    } catch (error: any) {
      handleError(error, 'clear completed todos');
    }
  };

  return (
    <TodoContext.Provider
      value={{
        state,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        clearCompleted,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// Custom hook to use the context
export const useTodoContext = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};