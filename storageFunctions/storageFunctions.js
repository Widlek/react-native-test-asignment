import AsyncStorage from '@react-native-async-storage/async-storage';


/**
 * Сохраняет массив задач в AsyncStorage
 * @param tasks - Массив задач для сохранения
 */
export const saveTasks = async (tasks) => {
  try {
    const jsonTasks = JSON.stringify(tasks);
    await AsyncStorage.setItem('@tasks', jsonTasks);
    console.log(tasks);
  } catch (e) {
    console.error('Ошибка сохранения задач:', e);
    // Дополнительная обработка ошибок при необходимости
  }
};



/**
 * Загружает задачи из AsyncStorage
 * @returns Массив задач или пустой массив при ошибке
 */
export const loadTasks = async () => {
  try {
    const jsonTasks = await AsyncStorage.getItem('@tasks');
    return jsonTasks ? JSON.parse(jsonTasks) : [];
  } catch (e) {
    console.error('Ошибка загрузки задач:', e);
    return [];
  }
};

export const addTask = async (task) => {
  try {
    const tasks = await loadTasks();
    tasks.push(task);
    console.log(task);
    await saveTasks(tasks);
  } catch (e) {
    console.error('Ошибка добавления задачи:', e);
    // Дополнительная обработка ошибок при необходимости
  }
};

export const updateTask = async (newTask) => {
  try{
    const tasks = await loadTasks();
    const taskToChange = tasks.findIndex((element)=> element.id === newTask.id);
    tasks[taskToChange] = newTask;
    await saveTasks(tasks);
  } catch(e){
    console.log('Ошибка при обновлении задачи:', e)
  }
}

export const removeTask = async (task) => {
  try{
    const tasks = await loadTasks();
    const taskToDelete = tasks.findIndex((element)=> element.id === task.id);
    tasks.splice(taskToDelete, 1);
    await saveTasks(tasks);
  } catch(e){

  }
}