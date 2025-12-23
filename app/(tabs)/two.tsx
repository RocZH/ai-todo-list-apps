import { StyleSheet, View as DefaultView, Text as DefaultText } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTodoContext } from '@/components/TodoContext';

export default function TabTwoScreen() {
  const { state } = useTodoContext();

  const completedCount = state.todos.filter(todo => todo.completed).length;
  const totalCount = state.todos.length;
  const pendingCount = totalCount - completedCount;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo Stats</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#007AFF' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Completion Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
        </Text>
      </View>
      
      {state.todos.length === 0 ? (
        <Text style={styles.emptyText}>Complete some tasks to see stats here!</Text>
      ) : (
        <>
          {state.todos.some(todo => todo.aiGenerated) && (
            <View style={styles.aiSection}>
              <Text style={styles.aiTitle}>AI-Powered Insights</Text>
              <Text style={styles.aiText}>
                You've added {state.todos.filter(t => t.aiGenerated).length} AI-generated tasks.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  progressLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  aiSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
