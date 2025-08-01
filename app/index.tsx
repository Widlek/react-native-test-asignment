import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import MainMenu from "./mainMenu"; // Убедитесь в правильном импорте

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <MainMenu />
    </View>
  );
}