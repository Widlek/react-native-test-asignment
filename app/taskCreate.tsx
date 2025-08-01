import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Keyboard,
  ScrollView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addTask } from '@/storageFunctions/storageFunctions'
import { TaskInterface } from '@/interfaces/taskInterface';

const TaskCreate = () => {
  // Navigation router
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  // Date picker visibility(separate for time and data cause datatime is broken on android)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [deadlineError, setDeadlineError] = useState('');

  // Set default deadline
  useEffect(() => {
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 1);
    setDeadline(defaultDeadline);
  }, []);

  // Task creation handler
  const handleCreateTask = async () => {
    // Validate title
    if (!title.trim()) {
      Alert.alert('Error', 'Title required');
      return;
    }

    let deadlineValue: string | null = null;
    
    // Validate deadline
    if (deadline) {
      if (deadline < new Date()) {
        setDeadlineError('Deadline must be future');
        return;
      }
      deadlineValue = deadline.toISOString();
    }

    // Create task object
    const newTask: TaskInterface = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      status: "In Progress",
      createdAt: new Date().toISOString(),
      deadline: deadlineValue,
      address: address.trim() || undefined
    };
    
    // Save to storage
    try {
      await addTask(newTask);
    } catch (e) {
      console.log("Add task error: ", e);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setAddress('');
    setDeadlineError('');
    Keyboard.dismiss();
    router.back();
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
  }

  // Time selection handler
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime && deadline) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDeadline(newDate);
    }
  }

  // Date formatter
  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {/* Title input */}
      <View className="mb-6">
        <Text className="text-textSecondary text-base mb-2">Task title*</Text>
        <TextInput
          className="border-b border-secondary py-3 text-textPrimary text-lg"
          placeholder="Enter title"
          placeholderTextColor="#86EFAC"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          autoFocus={true}
        />
      </View>

      {/* Description input */}
      <View className="mb-6">
        <Text className="text-textSecondary text-base mb-2">Description</Text>
        <TextInput
          className="border-b border-secondary py-3 text-textPrimary text-base h-24"
          placeholder="Add description"
          placeholderTextColor="#86EFAC"
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
          maxLength={500}
        />
      </View>

      {/* Address input */}
      <View className="mb-6">
        <Text className="text-textSecondary text-base mb-2">Address</Text>
        <TextInput
          className="border-b border-secondary py-3 text-textPrimary text-base"
          placeholder="Enter address"
          placeholderTextColor="#86EFAC"
          value={address}
          onChangeText={setAddress}
          maxLength={200}
        />
      </View>

      {/* Deadline selector */}
      <View className="mb-8">
        <Text className="text-textSecondary text-base mb-2">Deadline</Text>
        
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
        
        {/* Deadline validation */}
        {deadlineError ? (
          <Text className="text-error text-sm mt-2">{deadlineError}</Text>
        ) : (
          <Text className="text-textSecondary text-xs mt-2">
            Tap to select deadline
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-between mt-4">
        <Link href=".." asChild>
          <TouchableOpacity className="py-3 px-6 border border-secondary rounded-md flex-1 mr-2 justify-center items-center">
            <Text className="text-textSecondary font-medium">Cancel</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          className={`py-3 px-6 rounded-md flex-1 ml-2 justify-center items-center ${
            title.trim() ? 'bg-primary' : 'bg-secondary opacity-70'
          }`}
          onPress={handleCreateTask}
          disabled={!title.trim()}
        >
          <Text className="text-textContrast font-medium">Create Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TaskCreate;