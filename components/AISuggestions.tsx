import React, { useState, useCallback } from 'react';
import {
  View as DefaultView,
  Text as DefaultText,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAIService } from '@/components/AIService';
import { useTodoContext } from '@/components/TodoContext';

interface SuggestionItemProps {
  text: string;
  onAdd: (text: string) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = React.memo(({ text, onAdd }) => {
  return (
    <View style={styles.suggestionItem}>
      <Text style={styles.suggestionText} numberOfLines={2} ellipsizeMode="tail">
        {text}
      </Text>
      <TouchableOpacity 
        onPress={() => onAdd(text)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
});

const AISuggestions: React.FC = () => {
  const { generateTodoSuggestions, generateTodoList, isLoading, error } = useAIService();
  const { addTodo } = useTodoContext();
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  const handleGetSuggestions = async () => {
    if (!inputText.trim()) return;
    
    const result = await generateTodoSuggestions(inputText);
    setSuggestions(result);
    setShowSuggestionModal(true);
  };

  const handleGenerateList = async () => {
    if (!inputText.trim()) return;
    
    const result = await generateTodoList(inputText);
    setGeneratedList(result);
    setShowListModal(true);
  };

  const handleAddSuggestion = useCallback((suggestion: string) => {
    addTodo(suggestion, true); // aiGenerated = true
  }, [addTodo]);

  const handleAddAllSuggestions = useCallback(() => {
    suggestions.forEach(suggestion => {
      addTodo(suggestion, true); // aiGenerated = true
    });
    setShowSuggestionModal(false);
  }, [suggestions, addTodo]);

  const handleAddAllListItems = useCallback(() => {
    generatedList.forEach(item => {
      addTodo(item, true); // aiGenerated = true
    });
    setShowListModal(false);
  }, [generatedList, addTodo]);

  const handleKeyPress = useCallback((event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      // Default to getting suggestions when enter is pressed
      handleGetSuggestions();
    }
  }, [inputText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Todo Assistant</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Describe your goals or tasks..."
          style={styles.input}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          onKeyPress={handleKeyPress}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={handleGetSuggestions} 
          style={[styles.button, styles.suggestionButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Get Suggestions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleGenerateList} 
          style={[styles.button, styles.listButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Generate Todo List</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <Text style={styles.loadingText}>AI is thinking...</Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {/* Suggestion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSuggestionModal}
        onRequestClose={() => setShowSuggestionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Suggestions</Text>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <SuggestionItem 
                  text={item} 
                  onAdd={handleAddSuggestion} 
                />
              )}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowSuggestionModal(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAllSuggestions}
                style={styles.modalAddAllButton}
              >
                <Text style={styles.modalAddAllButtonText}>Add All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showListModal}
        onRequestClose={() => setShowListModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generated Todo List</Text>
            <FlatList
              data={generatedList}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <SuggestionItem 
                  text={item} 
                  onAdd={handleAddSuggestion} 
                />
              )}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowListModal(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAllListItems}
                style={styles.modalAddAllButton}
              >
                <Text style={styles.modalAddAllButtonText}>Add All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  suggestionButton: {
    backgroundColor: '#007AFF',
  },
  listButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalListContent: {
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelButtonText: {
    color: '#007AFF',
  },
  modalAddAllButton: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalAddAllButtonText: {
    color: 'white',
  },
});

export default AISuggestions;