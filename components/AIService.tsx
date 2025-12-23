import { useState, useCallback } from 'react';

// Mock AI service - in a real app, this would connect to an actual AI service
export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to generate AI suggestions based on user input
  const generateTodoSuggestions = useCallback(async (input: string): Promise<string[]> => {
    if (!input.trim()) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Extract keywords from input for more targeted suggestions
      const lowerInput = input.toLowerCase();
      const keywords = lowerInput.split(/\s+/).filter(word => word.length > 2);
      
      // Mock AI responses based on keywords
      const suggestions: string[] = [];
      
      // Work-related keywords
      if (lowerInput.includes('work') || lowerInput.includes('project') || lowerInput.includes('task') || 
          lowerInput.includes('deadline') || lowerInput.includes('meeting') || lowerInput.includes('report')) {
        suggestions.push(
          'Complete project proposal',
          'Schedule team meeting',
          'Review quarterly reports',
          'Update project timeline',
          'Prepare presentation materials',
          'Follow up on pending tasks'
        );
      }
      
      // Health and fitness keywords
      if (lowerInput.includes('health') || lowerInput.includes('exercise') || lowerInput.includes('fitness') || 
          lowerInput.includes('diet') || lowerInput.includes('wellness') || lowerInput.includes('gym')) {
        suggestions.push(
          '30-minute morning jog',
          'Drink 8 glasses of water',
          'Schedule doctor appointment',
          'Prepare healthy meals for the week',
          'Track daily steps and activity',
          'Practice meditation for 10 minutes'
        );
      }
      
      // Learning keywords
      if (lowerInput.includes('learn') || lowerInput.includes('study') || lowerInput.includes('course') || 
          lowerInput.includes('skill') || lowerInput.includes('education') || lowerInput.includes('training')) {
        suggestions.push(
          'Read one chapter of the book',
          'Complete online course module',
          'Practice coding exercises',
          'Take notes on new concepts',
          'Review learning objectives',
          'Join study group or forum'
        );
      }
      
      // Personal/family keywords
      if (lowerInput.includes('personal') || lowerInput.includes('family') || lowerInput.includes('home') || 
          lowerInput.includes('relationship') || lowerInput.includes('relax') || lowerInput.includes('hobby')) {
        suggestions.push(
          'Call family members',
          'Plan weekend activities',
          'Organize personal documents',
          'Clean and organize living space',
          'Plan quality time with loved ones',
          'Explore new hobby or interest'
        );
      }
      
      // Add general suggestions if specific ones weren't added
      if (suggestions.length === 0) {
        // Check for specific keywords in the input
        for (const keyword of keywords) {
          if (keyword.includes('plan') || keyword.includes('organize')) {
            suggestions.push(
              'Break task into smaller steps',
              'Set specific deadlines',
              'Create accountability system',
              'Schedule regular review sessions'
            );
            break;
          }
          
          if (keyword.includes('improve') || keyword.includes('better')) {
            suggestions.push(
              'Identify specific improvement goals',
              'Track progress daily',
              'Research best practices',
              'Find a mentor or advisor'
            );
            break;
          }
        }
      }
      
      // If still no suggestions, provide general ones
      if (suggestions.length === 0) {
        suggestions.push(
          'Break task into smaller steps',
          'Set a specific deadline',
          'Research required resources',
          'Create a plan of action',
          'Identify potential obstacles',
          'Schedule regular progress checks'
        );
      }
      
      // Remove duplicates and limit to 6 suggestions
      const uniqueSuggestions = [...new Set(suggestions)];
      return uniqueSuggestions.slice(0, 6);
    } catch (err) {
      setError('Failed to generate AI suggestions');
      console.error('AI Service Error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to generate a complete todo list based on a topic
  const generateTodoList = useCallback(async (topic: string): Promise<string[]> => {
    if (!topic.trim()) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const lowerTopic = topic.toLowerCase();
      
      // Mock AI responses based on topic
      if (lowerTopic.includes('project') || lowerTopic.includes('launch')) {
        return [
          'Define project goals and objectives',
          'Create project timeline with milestones',
          'Identify required resources and budget',
          'Assign team roles and responsibilities',
          'Set up project management tools',
          'Schedule regular progress meetings',
          'Prepare project status reports',
          'Conduct risk assessment',
          'Plan for potential obstacles',
          'Prepare final project review'
        ];
      }
      
      if (lowerTopic.includes('trip') || lowerTopic.includes('vacation') || lowerTopic.includes('travel')) {
        return [
          'Research destination and create detailed itinerary',
          'Book accommodation and flights',
          'Check visa/travel requirements',
          'Pack necessary items',
          'Inform bank of travel dates',
          'Arrange travel insurance',
          'Plan activities and reservations',
          'Prepare emergency contacts list',
          'Exchange currency if needed',
          'Download offline maps and guides'
        ];
      }
      
      if (lowerTopic.includes('study') || lowerTopic.includes('exam') || lowerTopic.includes('course')) {
        return [
          'Create detailed study schedule',
          'Gather all required materials and resources',
          'Review course syllabus and exam format',
          'Form or join study groups',
          'Take practice tests regularly',
          'Review notes daily',
          'Rest properly before exam',
          'Prepare exam day essentials',
          'Plan breaks to avoid burnout',
          'Schedule final review session'
        ];
      }
      
      if (lowerTopic.includes('health') || lowerTopic.includes('fitness')) {
        return [
          'Schedule regular health checkups',
          'Create balanced workout routine',
          'Plan healthy meals for the week',
          'Set specific fitness goals',
          'Track progress and adjust as needed',
          'Research proper nutrition facts',
          'Schedule time for relaxation and rest',
          'Join a fitness class or group',
          'Prepare workout equipment',
          'Create accountability system'
        ];
      }
      
      // Default response for other topics
      return [
        'Define your main objective clearly',
        'Break down into smaller, manageable tasks',
        'Set realistic deadlines for each task',
        'Identify resources and tools needed',
        'Create accountability system',
        'Plan for potential obstacles and solutions',
        'Schedule regular progress review sessions',
        'Celebrate small milestones',
        'Track progress and adjust plan as needed',
        'Prepare for completion and next steps'
      ];
    } catch (err) {
      setError('Failed to generate AI todo list');
      console.error('AI Service Error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateTodoSuggestions,
    generateTodoList,
    isLoading,
    error,
  };
};