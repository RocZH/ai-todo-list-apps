import { useState } from 'react';

// Mock AI service - in a real app, this would connect to an actual AI service
export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to generate AI suggestions based on user input
  const generateTodoSuggestions = async (input: string): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI responses based on keywords
      const suggestions: string[] = [];
      
      if (input.toLowerCase().includes('work')) {
        suggestions.push(
          'Complete project proposal',
          'Schedule team meeting',
          'Review quarterly reports',
          'Update project timeline'
        );
      }
      
      if (input.toLowerCase().includes('health') || input.toLowerCase().includes('exercise')) {
        suggestions.push(
          '30-minute morning jog',
          'Drink 8 glasses of water',
          'Schedule doctor appointment',
          'Prepare healthy meals for the week'
        );
      }
      
      if (input.toLowerCase().includes('learn') || input.toLowerCase().includes('study')) {
        suggestions.push(
          'Read one chapter of the book',
          'Complete online course module',
          'Practice coding exercises',
          'Take notes on new concepts'
        );
      }
      
      if (input.toLowerCase().includes('personal') || input.toLowerCase().includes('family')) {
        suggestions.push(
          'Call family members',
          'Plan weekend activities',
          'Organize personal documents',
          'Clean and organize living space'
        );
      }
      
      // If no specific suggestions, provide general ones
      if (suggestions.length === 0) {
        suggestions.push(
          'Break task into smaller steps',
          'Set a specific deadline',
          'Research required resources',
          'Create a plan of action'
        );
      }
      
      // Limit to 4 suggestions
      return suggestions.slice(0, 4);
    } catch (err) {
      setError('Failed to generate AI suggestions');
      console.error('AI Service Error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a complete todo list based on a topic
  const generateTodoList = async (topic: string): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI responses based on topic
      if (topic.toLowerCase().includes('project')) {
        return [
          'Define project goals and objectives',
          'Create project timeline',
          'Identify required resources',
          'Assign team roles and responsibilities',
          'Set up project management tools',
          'Schedule regular progress meetings',
          'Prepare project status reports',
          'Conduct project review'
        ];
      }
      
      if (topic.toLowerCase().includes('trip') || topic.toLowerCase().includes('vacation')) {
        return [
          'Research destination and create itinerary',
          'Book accommodation and flights',
          'Check visa/travel requirements',
          'Pack necessary items',
          'Inform bank of travel dates',
          'Arrange travel insurance',
          'Plan activities and reservations',
          'Prepare emergency contacts list'
        ];
      }
      
      if (topic.toLowerCase().includes('study') || topic.toLowerCase().includes('exam')) {
        return [
          'Create study schedule',
          'Gather all required materials',
          'Review course syllabus',
          'Form study groups',
          'Take practice tests',
          'Review notes daily',
          'Rest properly before exam',
          'Prepare exam day essentials'
        ];
      }
      
      // Default response for other topics
      return [
        'Define your main objective',
        'Break down into smaller tasks',
        'Set deadlines for each task',
        'Identify resources needed',
        'Create accountability system',
        'Plan for potential obstacles',
        'Schedule regular review sessions',
        'Celebrate milestones'
      ];
    } catch (err) {
      setError('Failed to generate AI todo list');
      console.error('AI Service Error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateTodoSuggestions,
    generateTodoList,
    isLoading,
    error,
  };
};