/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // 添加这个插件以支持 animate-in 等动画效果
    require("tailwindcss-animate") 
  ],
}