import { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
// Local storage functions
import { loadTasks, updateTask, removeTask} from '@/storageFunctions/storageFunctions';
// Type definitions
import { TaskInterface } from '@/interfaces/taskInterface';

const TaskEditScreen = () => {
  // Route parameters
  const { id } = useLocalSearchParams();
  // Navigation hooks
  const router = useRouter();
  const navigation = useNavigation();
  
  // Task state
  const [task, setTask] = useState<TaskInterface | null>(null);
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'In Progress' | 'Completed' | 'Cancelled'>('In Progress');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [address, setAddress] = useState('');
  //Time and date stated(again two for android purposes)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // UI state
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Load task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const tasks = await loadTasks();
        const foundTask = tasks.find((t: TaskInterface) => t.id === id);
        
        if (foundTask) {
          setTask(foundTask);
          setTitle(foundTask.title);
          setDescription(foundTask.description);
          setStatus(foundTask.status);
          // Set deadline if valid
          if (foundTask.deadline) {
            const date = new Date(foundTask.deadline);
            if (!isNaN(date.getTime())) {
              setDeadline(date);
            }
          }
          setAddress(foundTask.address || '');
        } else {
          Alert.alert('Error', 'Task not found');
        }
      } catch (error) {
        console.error('Load error:', error);
        Alert.alert('Error', 'Load failed');
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [id]);

  // Configure header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleEditMode}>
          <Ionicons 
            name={isEditing ? "close-circle" : "create"} 
            size={28} 
            color={isEditing ? "#EF4444" : "#16A34A"} 
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>
      )
    });
  }, [navigation, isEditing]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Save task handler
  const handleSave = async () => {
    if (!task) return;

    // Prepare updated task
    const updatedTask: TaskInterface = {
      ...task,
      title,
      description,
      status,
      deadline: deadline ? deadline.toISOString() : null,
      address: address.trim() || undefined
    };

    try {
      await updateTask(updatedTask);
      setTask(updatedTask);
      setIsEditing(false);
      Alert.alert('Success', 'Task updated');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Save failed');
    }
  };

  // Delete task handler
  const handleDelete = async () => {
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
              await removeTask({ id: id as string });
              router.replace('/');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Deletion failed');
            }
          }
        }
      ]
    );
  };

  // Date selection handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(selectedDate);
      // Preserve existing time
      if (deadline) {
        newDate.setHours(deadline.getHours());
        newDate.setMinutes(deadline.getMinutes());
      }
      setDeadline(newDate);
      setShowTimePicker(true);
    }
  };

  // Time selection handler
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime && deadline) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDeadline(newDate);
    }
  };

  // Status change handler
  const handleStatusChange = async (newStatus: 'In Progress' | 'Completed' | 'Cancelled') => {
    if (!task) return;

    // Prepare status update
    const updatedTask: TaskInterface = {
      ...task,
      status: newStatus
    };

    try {
      await updateTask(updatedTask);
      setTask(updatedTask);
      setStatus(newStatus);
      Alert.alert('Success', 'Status updated');
    } catch (error) {
      console.error('Status error:', error);
      Alert.alert('Error', 'Update failed');
    }
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
  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  // Loading state UI
  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-textSecondary">Loading...</Text>
      </View>
    );
  }

  // Task not found UI
  if (!task) {
    return (
      <View className="flex-1 bg-background p-4 justify-center items-center">
        <Text className="text-textPrimary text-lg mb-6">Task not found</Text>
        <TouchableOpacity 
          className="py-3 px-6 bg-primary rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-textContrast font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {/* View mode */}
      {!isEditing && (
        <View className="mb-6">
          {/* Task header */}
          <View className="flex-row items-center mb-4">
            <View className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`} />
            <Text className="text-textPrimary text-xl font-bold">{title}</Text>
          </View>
          
          {/* Task description */}
          {description ? (
            <Text className="text-textSecondary mb-6">{description}</Text>
          ) : null}
          
          {/* Task details */}
          <View className="border-t border-secondary pt-4 mb-6">
            {/* Deadline */}
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={18} color="#16A34A" />
              <Text className="text-textPrimary ml-2">
                {deadline ? formatDateTime(deadline) : 'No deadline'}
              </Text>
            </View>
            
            {/* Address */}
            {address ? (
              <View className="flex-row items-center mb-3">
                <Ionicons name="location" size={18} color="#16A34A" />
                <Text className="text-textPrimary ml-2">{address}</Text>
              </View>
            ) : null}
            
            {/* Creation date */}
            <View className="flex-row items-center">
              <Ionicons name="time" size={18} color="#16A34A" />
              <Text className="text-textPrimary ml-2">
                Created: {new Date(task.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
          
          {/* Status selector */}
          <Text className="text-textSecondary text-base mb-3">Status:</Text>
          <View className="flex-row justify-between mb-6">
            {(['In Progress', 'Completed', 'Cancelled'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                className={`py-2 px-3 rounded-md flex-1 mx-1 items-center ${
                  status === option ? getStatusColor(option) : 'bg-backgroundSecondary'
                }`}
                onPress={() => handleStatusChange(option)}
              >
                <Text className={`font-medium ${
                  status === option ? 'text-textContrast' : 'text-textSecondary'
                }`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Edit mode */}
      {isEditing && (
        <View className="mb-6">
          {/* Title input */}
          <View className="mb-6">
            <Text className="text-textSecondary text-base mb-2">Title:</Text>
            <TextInput
              className="border-b border-secondary py-3 text-textPrimary text-lg"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor="#86EFAC"
            />
          </View>

          {/* Description input */}
          <View className="mb-6">
            <Text className="text-textSecondary text-base mb-2">Description:</Text>
            <TextInput
              className="border-b border-secondary py-3 text-textPrimary text-base h-24"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#86EFAC"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Address input */}
          <View className="mb-6">
            <Text className="text-textSecondary text-base mb-2">Address:</Text>
            <TextInput
              className="border-b border-secondary py-3 text-textPrimary text-base"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              placeholderTextColor="#86EFAC"
            />
          </View>

          {/* Deadline selector */}
          <View className="mb-6">
            <Text className="text-textSecondary text-base mb-2">Deadline:</Text>
            <TouchableOpacity 
              className="flex-row items-center py-3 border-b border-secondary"
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#16A34A" />
              <Text className="ml-2 text-textPrimary text-base">
                {deadline ? formatDateTime(deadline) : 'Select date/time'}
              </Text>
            </TouchableOpacity>
            
            {/* Date picker */}
            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            
            {/* Time picker */}
            {showTimePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>

          {/* Status selector */}
          <View className="mb-6">
            <Text className="text-textSecondary text-base mb-2">Status:</Text>
            <View className="flex-row justify-between">
              {(['In Progress', 'Completed', 'Cancelled'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`py-2 px-3 rounded-md flex-1 mx-1 items-center ${
                    status === option ? getStatusColor(option) : 'bg-backgroundSecondary'
                  }`}
                  onPress={() => setStatus(option)}
                >
                  <Text className={`font-medium ${
                    status === option ? 'text-textContrast' : 'text-textSecondary'
                  }`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Edit mode actions */}
      {isEditing && (
        <View className="flex-row justify-between mt-4">
          {/* Delete button */}
          <TouchableOpacity 
            className="py-3 px-4 bg-error rounded-md flex-1 mr-2 justify-center items-center"
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="white" />
          </TouchableOpacity>
          
          {/* Cancel button */}
          <TouchableOpacity 
            className="py-3 px-4 border border-secondary rounded-md flex-1 mr-2 justify-center items-center"
            onPress={toggleEditMode}
          >
            <Text className="text-textSecondary font-medium">Cancel</Text>
          </TouchableOpacity>
          
          {/* Save button */}
          <TouchableOpacity 
            className="py-3 px-4 bg-primary rounded-md flex-1 justify-center items-center"
            onPress={handleSave}
          >
            <Text className="text-textContrast font-medium">Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default TaskEditScreen;