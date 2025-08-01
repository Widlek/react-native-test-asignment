import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Link, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { loadTasks, removeTask } from '@/storageFunctions/storageFunctions';
import { TaskInterface } from '@/interfaces/taskInterface';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MainMenu = () => {
  // Navigation router
  const router = useRouter();
  
  // State declarations
  const [tasks, setTasks] = useState<TaskInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState<'createdAt' | 'deadline' | 'status'>('createdAt');
  const [isReversed, setIsReversed] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Fetch tasks function
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const loadedTasks = await loadTasks();
      await setTasks(loadedTasks);
    } catch (error) {
      console.error('Load tasks error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tasks sorting logic
  const sortTasks = useCallback((tasks: TaskInterface[]) => {
    let sorted = [...tasks].sort((a, b) => {
      switch (sortMethod) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'status':
          const statusOrder = ['In Progress', 'Completed', 'Cancelled'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        default:
          return 0;
      }
    });
    return isReversed ? sorted.reverse() : sorted;
  }, [sortMethod, isReversed]);

  // Apply sorting
  const sortedTasks = sortTasks(tasks);

  // Task deletion handler
  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete task',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTask(taskId);
              await fetchTasks();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Deletion failed');
            }
          }
        }
      ]
    );
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-amber-400';
      case 'Completed': return 'bg-primary';
      case 'Cancelled': return 'bg-error';
      default: return 'bg-gray-400';
    }
  };

  // Date formatter
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Sort button text
  const getSortButtonText = () => {
    switch (sortMethod) {
      case 'createdAt': return 'By creation date';
      case 'deadline': return 'By deadline';
      case 'status': return 'By status';
      default: return 'Sort';
    }
  };

  // Focus effect reloader
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  // Loading state UI
  if (loading) {
    return (
      <View className="flex-1 bg-backgroundSecondary justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-backgroundSecondary">
      <SafeAreaView className="flex-1">
        {/* Sorting header */}
        <View className="p-4 bg-primary flex-row justify-between items-center">
          <Text className="text-textContrast font-medium text-lg">Tasks</Text>
          
          {/* Sort controls */}
          <View className="flex-row items-center">
            <TouchableOpacity
              className="py-2 px-3 rounded-md bg-primaryDark justify-center items-center"
              onPress={() => setIsReversed(!isReversed)}
            >
              {!isReversed ? (
                <Ionicons name="arrow-up" size={20} color="white" />
              ) : (
                <Ionicons name="arrow-down" size={20} color="white" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              className="ml-3 py-2 px-4 rounded-md bg-primaryDark flex-row items-center"
              onPress={() => setShowSortMenu(true)}
            >
              <Text className="text-textContrast font-medium mr-2">
                {getSortButtonText()}
              </Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort selection modal */}
        <Modal
          visible={showSortMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSortMenu(false)}
        >
          <TouchableOpacity 
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPress={() => setShowSortMenu(false)}
          >
            {/* Sort options */}
            <View className="bg-background rounded-md w-3/4 max-w-sm">
              <Text className="text-textPrimary font-bold text-lg p-4 border-b border-secondary">
                Sort by
              </Text>
              
              <TouchableOpacity
                className={`py-4 px-6 ${sortMethod === 'createdAt' ? 'bg-backgroundSecondary' : ''}`}
                onPress={() => {
                  setSortMethod('createdAt');
                  setShowSortMenu(false);
                }}
              >
                <Text className="text-textPrimary font-medium">By creation date</Text>
              </TouchableOpacity>
              
              <View className="border-t border-secondary" />
              
              <TouchableOpacity
                className={`py-4 px-6 ${sortMethod === 'deadline' ? 'bg-backgroundSecondary' : ''}`}
                onPress={() => {
                  setSortMethod('deadline');
                  setShowSortMenu(false);
                }}
              >
                <Text className="text-textPrimary font-medium">By deadline</Text>
              </TouchableOpacity>
              
              <View className="border-t border-secondary" />
              
              <TouchableOpacity
                className={`py-4 px-6 ${sortMethod === 'status' ? 'bg-backgroundSecondary' : ''}`}
                onPress={() => {
                  setSortMethod('status');
                  setShowSortMenu(false);
                }}
              >
                <Text className="text-textPrimary font-medium">By status</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Tasks list */}
        {sortedTasks.length > 0 ? (
          <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View className="bg-background p-4 mb-4 rounded-md border border-secondary relative">
                {/* Delete button */}
                <TouchableOpacity 
                  className="absolute top-4 right-4 w-10 h-10 justify-center items-center bg-red-50 rounded-md"
                  onPress={() => handleDeleteTask(item.id)}
                >
                  <Ionicons name="trash" size={24} color="#EF4444" />
                </TouchableOpacity>
                
                {/* Task header */}
                <View className="flex-row items-center mb-2">
                  <View className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} mr-2`} />
                  <TouchableOpacity onPress={() => router.push(`/taskDetails/${item.id}`)}>
                    <Text className="text-lg font-bold text-textPrimary flex-1 pr-10">{item.title}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Task description */}
                {item.description ? (
                  <Text className="text-textSecondary mb-2" numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                
                {/* Divider */}
                <View className="border-t border-gray-200 my-2" />
                
                {/* Dates section */}
                <View className="flex-row justify-between mt-1">
                  <View className="flex-col">
                    <Text className="text-xs text-textSecondary">Created:</Text>
                    <Text className="text-xs text-textSecondary">
                      {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  
                  {/* Deadline display */}
                  {item.deadline && (
                    <View className="flex-col items-end">
                      <Text className="text-xs font-bold text-textPrimary">Deadline:</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar" size={14} color="#052E16" className="mr-1" />
                        <Text className="text-xs font-bold text-textPrimary">
                          {formatDeadline(item.deadline)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        ) : (
          // Empty state
          <View className="flex-1 justify-center items-center px-4">
            <Ionicons name="document-text-outline" size={48} color="#86EFAC" />
            <Text className="text-xl text-textSecondary mt-4 text-center">
              No tasks. Add new task.
            </Text>
          </View>
        )}

        {/* Add task button */}
        <View className="absolute bottom-0 left-0 right-0 bg-backgroundSecondary py-3 border-t border-secondary">
          <Link 
            href="/taskCreate" 
            className="mx-auto w-12 h-12 rounded-md bg-primary justify-center items-center"
          >
            <Ionicons name="add" size={28} color="white" className="text-center" />
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default MainMenu;