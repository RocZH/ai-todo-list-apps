import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import TodoList from '@/components/TodoList';
import AISuggestions from '@/components/AISuggestions';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Todo List</Text>
      <AISuggestions />
      <TodoList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
});
