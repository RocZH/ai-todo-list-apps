import React, { useState, useCallback, useMemo } from 'react';
import {
  View as DefaultView,
  Text as DefaultText,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTodoContext } from '@/components/TodoContext';
import { formatRelativeTime } from '@/lib/timeUtils';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  aiGenerated?: boolean;
  created_at?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(({
  id,
  text,
  completed,
  aiGenerated,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim()) {
      onEdit(id, editText);
      setIsEditing(false);
      Keyboard.dismiss();
    } else {
      Alert.alert('Error', 'Todo text cannot be empty');
    }
  }, [editText, id, onEdit]);

  const toggleEditing = useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditText(text); // Revert to original text if canceling edit
    } else {
      setIsEditing(true);
    }
  }, [isEditing, text]);

  const handleKeyPress = useCallback((event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSaveEdit();
    }
  }, [handleSaveEdit]);

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity 
        onPress={() => onToggle(id)} 
        style={styles.checkbox}
        accessibilityLabel={`Mark ${completed ? 'incomplete' : 'complete'}: ${text}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
      >
        <View
          style={[
            styles.checkboxInner,
            completed && styles.checkboxCompleted,
          ]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            style={styles.editInput}
            autoFocus
            onSubmitEditing={handleSaveEdit}
            onBlur={handleSaveEdit}
            onKeyPress={handleKeyPress}
            accessibilityLabel="Edit todo text"
          />
        </View>
      ) : (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.todoText,
              completed && styles.todoTextCompleted,
              aiGenerated && styles.aiGeneratedText,
            ]}
            accessibilityLabel={text}
          >
            {text}
          </Text>
          {aiGenerated && (
            <Text style={styles.aiIndicator}>AI</Text>
          )}
          {created_at && (
            <Text style={styles.timeText}>{formatRelativeTime(created_at)}</Text>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={toggleEditing}
          style={styles.editButton}
          accessibilityLabel={isEditing ? 'Cancel editing' : 'Edit todo'}
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(id)}
          style={styles.deleteButton}
          accessibilityLabel={`Delete todo: ${text}`}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const TodoList: React.FC = () => {
  const { state, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } = useTodoContext();
  const [inputText, setInputText] = useState('');

  const handleAddTodo = useCallback(() => {
    if (inputText.trim()) {
      addTodo(inputText.trim());
      setInputText('');
      Keyboard.dismiss();
    }
  }, [inputText, addTodo]);

  const handleToggleTodo = useCallback((id: string) => {
    toggleTodo(id);
  }, [toggleTodo]);

  const handleDeleteTodo = useCallback((id: string) => {
    deleteTodo(id);
  }, [deleteTodo]);

  const handleEditTodo = useCallback((id: string, text: string) => {
    editTodo(id, text);
  }, [editTodo]);

  const handleClearCompleted = useCallback(() => {
    if (state.todos.filter(t => t.completed).length > 0) {
      Alert.alert(
        'Clear Completed Todos',
        'Are you sure you want to delete all completed todos?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: clearCompleted },
        ]
      );
    }
  }, [state.todos, clearCompleted]);

  const activeTodosCount = useMemo(() => state.todos.filter(t => !t.completed).length, [state.todos]);

  const handleKeyPress = useCallback((event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      handleAddTodo();
    }
  }, [handleAddTodo]);

  const renderTodoItem = useCallback(({ item }: { item: any }) => (
    <TodoItem
      id={item.id}
      text={item.text}
      completed={item.completed}
      aiGenerated={item.ai_generated}
      created_at={item.created_at}
      onToggle={handleToggleTodo}
      onDelete={handleDeleteTodo}
      onEdit={handleEditTodo}
    />
  ), [handleToggleTodo, handleDeleteTodo, handleEditTodo]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new task..."
          style={styles.input}
          onSubmitEditing={handleAddTodo}
          onKeyPress={handleKeyPress}
          accessibilityLabel="Add new todo input"
        />
        <TouchableOpacity 
          onPress={handleAddTodo} 
          style={styles.addButton}
          accessibilityLabel="Add todo button"
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.countText} accessibilityLabel={`Items left: ${activeTodosCount}`}>
          {activeTodosCount} {activeTodosCount === 1 ? 'item' : 'items'} left
        </Text>
        <TouchableOpacity 
          onPress={handleClearCompleted} 
          style={styles.clearButton}
          disabled={state.todos.filter(t => t.completed).length === 0}
          accessibilityLabel="Clear completed todos"
        >
          <Text style={styles.clearButtonText}>Clear Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel="List of todos"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  aiGeneratedText: {
    fontStyle: 'italic',
  },
  aiIndicator: {
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
    fontStyle: 'normal',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
});

export default TodoList;