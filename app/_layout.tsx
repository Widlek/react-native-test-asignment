import { Stack } from "expo-router";
import "./globals.css"
import { TurboModuleRegistry } from "react-native";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen
      name="index"
      options={{
        headerShown: false,
        statusBarHidden: false,
        navigationBarHidden: true,
      }}    
    />
    <Stack.Screen
      name="mainMenu"
      options={{
        headerShown: false,
        navigationBarHidden: true,
      }}    
    />
    <Stack.Screen
      name="taskDetails/[id]"
      options={{
        title: "О задаче:",
        statusBarHidden: true,
        navigationBarHidden: true,
      }}    
    />
    <Stack.Screen
      name="taskCreate"
      options={{
        title: "Создание новой задачи",
        headerShown: true,
        navigationBarHidden: true,
      }}    
    />
  </Stack>;
}
