import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTodoContext } from '@/components/TodoContext';
import { useAIService } from '@/components/AIService';
import { useState } from 'react';

export default function ModalScreen() {
  const { dispatch } = useTodoContext();
  const { generateTodoList, isLoading } = useAIService();
  const [inputText, setInputText] = useState('');
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState<string[]>([]);

  const handleAddSingleTask = () => {
    if (inputText.trim()) {
      dispatch({
        type: 'ADD_TODO',
        payload: { text: inputText.trim(), aiGenerated: true },
      });
      setInputText('');
    }
  };

  const handleGenerateFromTopic = async () => {
    if (!inputText.trim()) return;

    const tasks = await generateTodoList(inputText.trim());
    setAiGeneratedTasks(tasks);
  };

  const handleAddGeneratedTask = (task: string) => {
    dispatch({
      type: 'ADD_TODO',
      payload: { text: task, aiGenerated: true },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Task Assistant</Text>
      
      <Text style={styles.subtitle}>Add a single task</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter a task or topic..."
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddSingleTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>Or generate a list from a topic</Text>
      <TouchableOpacity 
        onPress={handleGenerateFromTopic} 
        style={[styles.generateButton, isLoading && styles.disabledButton]}
        disabled={isLoading}
      >
        <Text style={styles.generateButtonText}>
          {isLoading ? 'Generating...' : 'Generate List'}
        </Text>
      </TouchableOpacity>
      
      {aiGeneratedTasks.length > 0 && (
        <View style={styles.generatedListContainer}>
          <Text style={styles.generatedListTitle}>AI Generated Tasks:</Text>
          {aiGeneratedTasks.map((task, index) => (
            <View key={index} style={styles.generatedTaskItem}>
              <Text style={styles.generatedTaskText}>{task}</Text>
              <TouchableOpacity 
                onPress={() => handleAddGeneratedTask(task)}
                style={styles.addGeneratedButton}
              >
                <Text style={styles.addGeneratedButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
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
  generateButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  generatedListContainer: {
    flex: 1,
    marginTop: 10,
  },
  generatedListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  generatedTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  generatedTaskText: {
    flex: 1,
    fontSize: 16,
  },
  addGeneratedButton: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addGeneratedButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
