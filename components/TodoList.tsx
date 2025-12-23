import React, { useState } from 'react';
import {
  View as DefaultView,
  Text as DefaultText,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTodoContext } from '@/components/TodoContext';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  aiGenerated?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
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

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(id, editText);
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Todo text cannot be empty');
    }
  };

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={() => onToggle(id)} style={styles.checkbox}>
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
          />
          <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.todoText,
              completed && styles.todoTextCompleted,
              aiGenerated && styles.aiGeneratedText,
            ]}
          >
            {text}
          </Text>
          {aiGenerated && (
            <Text style={styles.aiIndicator}>AI</Text>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
          style={styles.editButton}
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(id)}
          style={styles.deleteButton}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TodoList: React.FC = () => {
  const { state, dispatch } = useTodoContext();
  const [inputText, setInputText] = useState('');

  const handleAddTodo = () => {
    if (inputText.trim()) {
      dispatch({
        type: 'ADD_TODO',
        payload: { text: inputText.trim() },
      });
      setInputText('');
    }
  };

  const handleToggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  };

  const handleDeleteTodo = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  };

  const handleEditTodo = (id: string, text: string) => {
    dispatch({ type: 'EDIT_TODO', payload: { id, text } });
  };

  const handleClearCompleted = () => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new task..."
          style={styles.input}
          onSubmitEditing={handleAddTodo}
        />
        <TouchableOpacity onPress={handleAddTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.countText}>
          {state.todos.filter(t => !t.completed).length} items left
        </Text>
        <TouchableOpacity onPress={handleClearCompleted} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            id={item.id}
            text={item.text}
            completed={item.completed}
            aiGenerated={item.aiGenerated}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onEdit={handleEditTodo}
          />
        )}
        style={styles.list}
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
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  list: {
    flex: 1,
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
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 4,
    padding: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default TodoList;