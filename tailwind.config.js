/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // 颜色系统
      colors: {
        'brand-blue': '#1e3a8a',     // 标题蓝色
        'app-bg': '#f5f7fa',         // 主背景色
        'app-text': '#333333',       // 主文本色
        'card-hover-shadow': 'rgba(0, 0, 0, 0.1)',
      },
      
      // 字体大小
      fontSize: {
        'title-xl': '3rem',          // h1
        'title-lg': '2.5rem',        // h2
        'title-md': '2rem',          // h3
        'title-sm': '1.5rem',        // h4
        'body-lg': '1.1rem',         // 按钮, 表单
      },
      
      // 边框圆角
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
      },
      
      // 阴影
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'table': '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      
      // 间距
      spacing: {
        'card-padding': '1.5rem',
        'container-gap': '1rem',
      },
      
      // 容器
      maxWidth: {
        'app-container': '1200px',
      },
      
      // 动画
      transitionDuration: {
        'default': '300ms',
        'hover': '200ms',
      },
    },
    // 字体系统
    fontFamily: {
      sans: ['Segoe UI', 'Roboto', 'Oxygen', 'sans-serif'],
    },
  },
  plugins: [],
}