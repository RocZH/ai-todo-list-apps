import React, { useState, useCallback, useMemo } from 'react';
import {
  View as DefaultView,
  Text as DefaultText,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Keyboard,
  Platform,
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
      <Text 
        style={styles.suggestionText} 
        numberOfLines={2} 
        ellipsizeMode="tail"
        accessibilityLabel={text}
      >
        {text}
      </Text>
      <TouchableOpacity 
        onPress={() => {
          onAdd(text);
          Keyboard.dismiss();
        }}
        style={styles.addButton}
        accessibilityLabel={`Add suggestion: ${text}`}
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

  const handleGetSuggestions = useCallback(async () => {
    if (!inputText.trim()) return;
    
    const result = await generateTodoSuggestions(inputText);
    setSuggestions(result);
    setShowSuggestionModal(true);
  }, [inputText, generateTodoSuggestions]);

  const handleGenerateList = useCallback(async () => {
    if (!inputText.trim()) return;
    
    const result = await generateTodoList(inputText);
    setGeneratedList(result);
    setShowListModal(true);
  }, [inputText, generateTodoList]);

  const handleAddSuggestion = useCallback((suggestion: string) => {
    addTodo(suggestion, true); // aiGenerated = true
  }, [addTodo]);

  const handleAddAllSuggestions = useCallback(() => {
    suggestions.forEach(suggestion => {
      addTodo(suggestion, true); // aiGenerated = true
    });
    setShowSuggestionModal(false);
    Keyboard.dismiss();
  }, [suggestions, addTodo]);

  const handleAddAllListItems = useCallback(() => {
    generatedList.forEach(item => {
      addTodo(item, true); // aiGenerated = true
    });
    setShowListModal(false);
    Keyboard.dismiss();
  }, [generatedList, addTodo]);

  const handleKeyPress = useCallback((event: any) => {
    if (event.nativeEvent.key === 'Enter' && Platform.OS === 'android') {
      // On Android, handle enter key press to get suggestions
      handleGetSuggestions();
    }
  }, [handleGetSuggestions]);

  const handleInputSubmit = useCallback(() => {
    if (inputText.trim()) {
      handleGetSuggestions();
    }
  }, [inputText, handleGetSuggestions]);

  const renderSuggestionItem = useCallback(({ item }: { item: any }) => (
    <SuggestionItem 
      text={item} 
      onAdd={handleAddSuggestion} 
    />
  ), [handleAddSuggestion]);

  const renderListItem = useCallback(({ item }: { item: any }) => (
    <SuggestionItem 
      text={item} 
      onAdd={handleAddSuggestion} 
    />
  ), [handleAddSuggestion]);

  const hasSuggestions = useMemo(() => suggestions.length > 0, [suggestions]);
  const hasGeneratedList = useMemo(() => generatedList.length > 0, [generatedList]);

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityLabel="AI Todo Assistant">AI Todo Assistant</Text>
      
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
          onSubmitEditing={handleInputSubmit}
          accessibilityLabel="Describe your goals or tasks for AI suggestions"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={handleGetSuggestions} 
          style={[styles.button, styles.suggestionButton]}
          disabled={isLoading || !inputText.trim()}
          accessibilityLabel="Get AI suggestions"
        >
          <Text style={styles.buttonText}>Get Suggestions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleGenerateList} 
          style={[styles.button, styles.listButton]}
          disabled={isLoading || !inputText.trim()}
          accessibilityLabel="Generate AI todo list"
        >
          <Text style={styles.buttonText}>Generate Todo List</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <Text style={styles.loadingText} accessibilityLabel="AI is thinking">AI is thinking...</Text>
      )}
      
      {error && (
        <Text style={styles.errorText} accessibilityLabel={`Error: ${error}`}>{error}</Text>
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
            <Text style={styles.modalTitle} accessibilityLabel="AI Suggestions">AI Suggestions</Text>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderSuggestionItem}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
              accessibilityLabel="List of AI suggestions"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowSuggestionModal(false);
                  Keyboard.dismiss();
                }}
                style={styles.modalCancelButton}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAllSuggestions}
                style={styles.modalAddAllButton}
                disabled={!hasSuggestions}
                accessibilityLabel="Add all suggestions"
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
            <Text style={styles.modalTitle} accessibilityLabel="Generated Todo List">Generated Todo List</Text>
            <FlatList
              data={generatedList}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderListItem}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
              accessibilityLabel="List of generated todo items"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowListModal(false);
                  Keyboard.dismiss();
                }}
                style={styles.modalCancelButton}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAllListItems}
                style={styles.modalAddAllButton}
                disabled={!hasGeneratedList}
                accessibilityLabel="Add all items"
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
    backgroundColor: 'white',
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
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
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