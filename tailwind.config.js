/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Основные цвета
        primary: "#22C55E",    // Яркий зеленый (акцентные элементы)
        primaryDark: "#16A34A", // Темный зеленый (активные состояния)
        
        // Вторичные цвета
        secondary: "#86EFAC",   // Светлый зеленый (второстепенные элементы)
        secondaryDark: "#4ADE80", // Средний зеленый (иконки)
        
        // Фоновые цвета
        background: "#FFFFFF", // Основной белый фон
        backgroundSecondary: "#F0FDF4", // Светло-зеленый фон (карточки)
        
        // Текстовые цвета
        textPrimary: "#052E16",   // Темно-зеленый (основной текст)
        textSecondary: "#166534", // Средне-зеленый (второстепенный текст)
        textContrast: "#FFFFFF",  // Белый (текст на зеленом фоне)
        
        // Дополнительные оттенки
        success: "#10B981",     // Цвет успешных операций
        error: "#EF4444"        // Цвет ошибок (красный)
      }
    },
  },
  plugins: [],
}