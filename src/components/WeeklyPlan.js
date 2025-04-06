import React, { useState, useEffect } from 'react';
import { getAllRecipes } from '../services/recipeService';

const WeeklyPlan = ({ onGenerateShoppingList }) => {
  const [recipes, setRecipes] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState(() => generateEmptyPlan());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 用于主料输入的状态
  const [inputMainIngredients, setInputMainIngredients] = useState('');
  const [availableMainIngredients, setAvailableMainIngredients] = useState([]);

  useEffect(() => {
    loadRecipes();
    // 从localStorage加载已保存的计划
    const savedPlan = localStorage.getItem('weeklyPlan');
    if (savedPlan) {
      try {
        setWeeklyPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("无法解析保存的计划", e);
      }
    }
  }, []);

  // 当计划变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);
  
  // 加载所有可用的主料（用于展示选项）
  useEffect(() => {
    if (recipes.length > 0) {
      const allMainIngredients = Array.from(
        new Set(
          recipes
            .filter(recipe => recipe.mainIngredient)
            .map(recipe => recipe.mainIngredient)
        )
      ).sort();
      setAvailableMainIngredients(allMainIngredients);
    }
  }, [recipes]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("正在从Firestore获取食谱...");
      const recipesData = await getAllRecipes();
      console.log("获取到的食谱:", recipesData);
      setRecipes(recipesData);
    } catch (error) {
      console.error("加载食谱失败", error);
      setError("无法加载食谱，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  // 生成空的周计划模板
  function generateEmptyPlan() {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const meals = ['早餐', '午餐', '晚餐'];
    
    return days.map(day => ({
      day,
      meals: meals.map(mealType => ({
        type: mealType,
        recipe: null
      }))
    }));
  }

  // 为餐点选择食谱
  const handleSelectRecipe = (dayIndex, mealIndex, recipe) => {
    const newPlan = [...weeklyPlan];
    newPlan[dayIndex].meals[mealIndex].recipe = recipe;
    setWeeklyPlan(newPlan);
  };
  
  // 处理主料输入变化
  const handleMainIngredientInputChange = (e) => {
    setInputMainIngredients(e.target.value);
  };
  
  // 处理智能生成按钮点击
  const handleSmartPlanClick = () => {
    if (inputMainIngredients.trim()) {
      // 有主料输入，使用包含主料的智能生成
      generateSmartPlanWithIngredients();
    } else {
      // 无主料输入，使用普通智能生成
      generateSmartPlan();
    }
  };
  
  // 打印周计划
  const handlePrintWeeklyPlan = () => {
    // 创建一个新的打印样式表
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-section, .print-section * {
          visibility: visible;
        }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print-section th, .print-section td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        .print-section table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-section h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        .no-print {
          display: none !important;
        }
        .print-section .recipe-info {
          margin-top: 4px;
          font-size: 12px;
        }
        .print-section .day-cell {
          font-weight: bold;
          background-color: #f5f5f5;
        }
      }
    `;
    document.head.appendChild(style);
    
    // 创建打印内容
    const printContent = document.createElement('div');
    printContent.className = 'print-section';
    
    // 添加标题
    const title = document.createElement('h2');
    title.textContent = '一周餐饮计划';
    printContent.appendChild(title);
    
    // 创建表格
    const table = document.createElement('table');
    
    // 添加表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['日期', '早餐', '午餐', '晚餐'].forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 添加表体
    const tbody = document.createElement('tbody');
    weeklyPlan.forEach(day => {
      const row = document.createElement('tr');
      
      // 日期单元格
      const dayCell = document.createElement('td');
      dayCell.className = 'day-cell';
      dayCell.textContent = day.day;
      row.appendChild(dayCell);
      
      // 餐点单元格
      day.meals.forEach(meal => {
        const cell = document.createElement('td');
        
        if (meal.recipe) {
          // 菜名
          const recipeName = document.createElement('div');
          recipeName.textContent = meal.recipe.name;
          recipeName.style.fontWeight = 'bold';
          cell.appendChild(recipeName);
          
          // 主料
          if (meal.recipe.mainIngredient) {
            const mainIngredient = document.createElement('div');
            mainIngredient.className = 'recipe-info';
            mainIngredient.textContent = `主料: ${meal.recipe.mainIngredient}`;
            cell.appendChild(mainIngredient);
          }
          
          // 准备时间
          if (meal.recipe.prepTime) {
            const prepTime = document.createElement('div');
            prepTime.className = 'recipe-info';
            prepTime.textContent = `准备: ${meal.recipe.prepTime}`;
            cell.appendChild(prepTime);
          }
        } else {
          cell.textContent = '未指定';
          cell.style.color = '#999';
        }
        
        row.appendChild(cell);
      });
      
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    printContent.appendChild(table);
    
    // 添加到文档
    document.body.appendChild(printContent);
    
    // 打印
    window.print();
    
    // 清理
    document.body.removeChild(printContent);
    document.head.removeChild(style);
  };

  // 智能生成周计划（考虑指定主料）
  const generateSmartPlanWithIngredients = () => {
    if (recipes.length === 0) return;
    
    // 解析输入的主料（先替换中文逗号，然后去除空格，分割英文逗号）
    const mainIngredientsArray = inputMainIngredients
      .replace(/，/g, ',') // 将中文逗号替换为英文逗号
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    if (mainIngredientsArray.length === 0) {
      // 如果没有有效的主料输入，使用普通智能生成
      generateSmartPlan();
      return;
    }
    
    // 分类食谱
    const breakfastRecipes = recipes.filter(r => r.category === '早餐');
    const lunchRecipes = recipes.filter(r => r.category === '午餐' || r.category === '主菜');
    const dinnerRecipes = recipes.filter(r => r.category === '晚餐' || r.category === '主菜');
    
    // 找出包含指定主料的食谱
    const preferredRecipes = recipes.filter(recipe => 
      recipe.mainIngredient && 
      mainIngredientsArray.some(ingredient => 
        recipe.mainIngredient.toLowerCase().includes(ingredient.toLowerCase())
      )
    );
    
    console.log("找到的包含指定主料的食谱:", preferredRecipes.length);
    
    if (preferredRecipes.length === 0) {
      alert(`没有找到包含 ${mainIngredientsArray.join('、')} 的食谱，将使用普通智能生成。`);
      generateSmartPlan();
      return;
    }
    
    // 按主料分组优先食谱
    const preferredByMainIngredient = {};
    preferredRecipes.forEach(recipe => {
      if (!recipe.mainIngredient) return;
      
      if (!preferredByMainIngredient[recipe.mainIngredient]) {
        preferredByMainIngredient[recipe.mainIngredient] = [];
      }
      preferredByMainIngredient[recipe.mainIngredient].push(recipe);
    });
    
    // 记录已使用的食谱和主料，避免短期内重复
    const usedRecipes = new Set();
    const usedMainIngredients = new Set();
    const usedPreferredMainIngredients = new Set();
    
    // 记录每个餐点是否已分配优先主料的食谱
    const mealAssigned = Array(7).fill().map(() => Array(3).fill(false));
    
    // 生成计划
    const newPlan = [...weeklyPlan];
    
    // 第一步：尝试为午餐和晚餐分配优先主料
    const validPreferredIngredients = Object.keys(preferredByMainIngredient);
    let preferredIngredientUsage = {};
    validPreferredIngredients.forEach(ingredient => {
      preferredIngredientUsage[ingredient] = 0;
    });
    
    // 计算每种优先主料应该分配的餐点数
    const totalMainMeals = 7 * 2; // 7天，每天午餐和晚餐
    const preferredMealsPerIngredient = Math.max(
      1, 
      Math.min(4, Math.floor(totalMainMeals / validPreferredIngredients.length))
    );
    
    console.log(`每种优先主料分配约 ${preferredMealsPerIngredient} 个餐点`);
    
    // 第一轮：分配优先主料，确保每种主料至少出现一次
    newPlan.forEach((day, dayIndex) => {
      // 主要针对午餐和晚餐分配优先主料
      for (let mealIndex = 1; mealIndex <= 2; mealIndex++) {
        // 跳过已分配的餐点
        if (mealAssigned[dayIndex][mealIndex]) continue;
        
        // 找出使用最少的优先主料
        let selectedIngredient = null;
        let minUsage = Number.MAX_SAFE_INTEGER;
        
        for (const ingredient of validPreferredIngredients) {
          if (preferredIngredientUsage[ingredient] < minUsage && 
              preferredIngredientUsage[ingredient] < preferredMealsPerIngredient) {
            selectedIngredient = ingredient;
            minUsage = preferredIngredientUsage[ingredient];
          }
        }
        
        // 如果找到了可用的优先主料
        if (selectedIngredient) {
          const availableRecipes = preferredByMainIngredient[selectedIngredient]
            .filter(r => !usedRecipes.has(r.id));
          
          if (availableRecipes.length > 0) {
            // 随机选一个该主料的食谱
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            day.meals[mealIndex].recipe = availableRecipes[randomIndex];
            
            // 标记该餐点已分配
            mealAssigned[dayIndex][mealIndex] = true;
            
            // 更新使用记录
            usedRecipes.add(day.meals[mealIndex].recipe.id);
            usedMainIngredients.add(selectedIngredient);
            usedPreferredMainIngredients.add(selectedIngredient);
            preferredIngredientUsage[selectedIngredient]++;
          }
        }
      }
    });
    
    // 第二步：为剩余的餐点分配普通食谱，避免主料重复
    newPlan.forEach((day, dayIndex) => {
      const isWeekend = dayIndex >= 5; // 周六日
      
      // 早餐
      if (!mealAssigned[dayIndex][0]) {
        let breakfastPool = breakfastRecipes.length > 0 ? [...breakfastRecipes] : [...recipes];
        breakfastPool = breakfastPool.filter(r => !usedRecipes.has(r.id));
        
        if (breakfastPool.length === 0) {
          breakfastPool = breakfastRecipes.length > 0 ? [...breakfastRecipes] : [...recipes];
        }
        
        if (breakfastPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * breakfastPool.length);
          day.meals[0].recipe = breakfastPool[randomIndex];
          
          if (day.meals[0].recipe) {
            usedRecipes.add(day.meals[0].recipe.id);
            if (day.meals[0].recipe.mainIngredient) {
              usedMainIngredients.add(day.meals[0].recipe.mainIngredient);
            }
          }
        }
      }
      
      // 午餐
      if (!mealAssigned[dayIndex][1]) {
        let lunchPool = lunchRecipes.length > 0 ? [...lunchRecipes] : [...recipes];
        lunchPool = lunchPool.filter(r => !usedRecipes.has(r.id));
        
        // 尝试避免主料重复（针对当天）
        const todayMainIngredients = new Set();
        day.meals.forEach(meal => {
          if (meal.recipe && meal.recipe.mainIngredient) {
            todayMainIngredients.add(meal.recipe.mainIngredient);
          }
        });
        
        const lunchPoolNonDuplicate = lunchPool.filter(r => 
          !r.mainIngredient || !todayMainIngredients.has(r.mainIngredient)
        );
        
        if (lunchPoolNonDuplicate.length > 0) {
          lunchPool = lunchPoolNonDuplicate;
        }
        
        if (lunchPool.length === 0) {
          lunchPool = lunchRecipes.length > 0 ? [...lunchRecipes] : [...recipes];
        }
        
        if (lunchPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * lunchPool.length);
          day.meals[1].recipe = lunchPool[randomIndex];
          
          if (day.meals[1].recipe) {
            usedRecipes.add(day.meals[1].recipe.id);
            if (day.meals[1].recipe.mainIngredient) {
              usedMainIngredients.add(day.meals[1].recipe.mainIngredient);
            }
          }
        }
      }
      
      // 晚餐
      if (!mealAssigned[dayIndex][2]) {
        let dinnerPool = dinnerRecipes.length > 0 ? [...dinnerRecipes] : [...recipes];
        dinnerPool = dinnerPool.filter(r => !usedRecipes.has(r.id));
        
        // 尝试避免主料重复（针对当天）
        const todayMainIngredients = new Set();
        day.meals.forEach(meal => {
          if (meal.recipe && meal.recipe.mainIngredient) {
            todayMainIngredients.add(meal.recipe.mainIngredient);
          }
        });
        
        const dinnerPoolNonDuplicate = dinnerPool.filter(r => 
          !r.mainIngredient || !todayMainIngredients.has(r.mainIngredient)
        );
        
        if (dinnerPoolNonDuplicate.length > 0) {
          dinnerPool = dinnerPoolNonDuplicate;
        }
        
        if (isWeekend) {
          // 周末筛选更复杂的料理（通过食材数量判断）
          const complexRecipes = dinnerPool.filter(r => r.ingredients && r.ingredients.length >= 5);
          if (complexRecipes.length > 0) {
            dinnerPool = complexRecipes;
          }
        }
        
        if (dinnerPool.length === 0) {
          dinnerPool = dinnerRecipes.length > 0 ? [...dinnerRecipes] : [...recipes];
        }
        
        if (dinnerPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * dinnerPool.length);
          day.meals[2].recipe = dinnerPool[randomIndex];
          
          if (day.meals[2].recipe) {
            usedRecipes.add(day.meals[2].recipe.id);
            if (day.meals[2].recipe.mainIngredient) {
              usedMainIngredients.add(day.meals[2].recipe.mainIngredient);
            }
          }
        }
      }
    });
    
    setWeeklyPlan(newPlan);
    
    // 统计优先主料的使用情况
    const totalUsedPreferred = Object.values(preferredIngredientUsage).reduce((sum, count) => sum + count, 0);
    console.log("优先主料使用情况:", preferredIngredientUsage);
    console.log("总共使用的优先主料餐点:", totalUsedPreferred);
    
    // 清空主料输入
    setInputMainIngredients('');
    
    // 如果没有使用任何优先主料，显示提示
    if (totalUsedPreferred === 0) {
      alert("无法使用指定的主料生成菜单，请检查主料拼写或添加相关食谱。");
    } else if (totalUsedPreferred < validPreferredIngredients.length) {
      // 找出未使用的优先主料
      const unusedIngredients = validPreferredIngredients.filter(
        ingredient => preferredIngredientUsage[ingredient] === 0
      );
      
      if (unusedIngredients.length > 0) {
        alert(`部分主料没有被使用: ${unusedIngredients.join('、')}。请检查这些主料的食谱是否存在。`);
      }
    }
  };

  // 原来的智能生成周计划（没有指定主料）
  const generateSmartPlan = () => {
    if (recipes.length === 0) return;
    
    // 1. 分类食谱
    const breakfastRecipes = recipes.filter(r => r.category === '早餐');
    const lunchRecipes = recipes.filter(r => r.category === '午餐' || r.category === '主菜');
    const dinnerRecipes = recipes.filter(r => r.category === '晚餐' || r.category === '主菜');
    
    // 2. 记录已使用的食谱和主料，避免短期内重复
    const usedRecipes = new Set();
    const usedMainIngredients = new Set();
    
    // 3. 生成计划
    const newPlan = [...weeklyPlan];
    
    // 为每天安排餐点
    newPlan.forEach((day, dayIndex) => {
      const isWeekend = dayIndex >= 5; // 周六日

      // 早餐
      let breakfastPool = breakfastRecipes.length > 0 ? [...breakfastRecipes] : [...recipes];
      breakfastPool = breakfastPool.filter(r => !usedRecipes.has(r.id));
      if (breakfastPool.length === 0) breakfastPool = breakfastRecipes.length > 0 ? [...breakfastRecipes] : [...recipes];
      
      day.meals[0].recipe = breakfastPool[Math.floor(Math.random() * breakfastPool.length)];
      if (day.meals[0].recipe) {
        usedRecipes.add(day.meals[0].recipe.id);
        if (day.meals[0].recipe.mainIngredient) {
          usedMainIngredients.add(day.meals[0].recipe.mainIngredient);
        }
      }
      
      // 午餐
      let lunchPool = lunchRecipes.length > 0 ? [...lunchRecipes] : [...recipes];
      lunchPool = lunchPool.filter(r => !usedRecipes.has(r.id));
      // 尝试避免主料重复
      const lunchPoolNonDuplicate = lunchPool.filter(r => 
        !r.mainIngredient || !usedMainIngredients.has(r.mainIngredient)
      );
      if (lunchPoolNonDuplicate.length > 0) lunchPool = lunchPoolNonDuplicate;
      if (lunchPool.length === 0) lunchPool = lunchRecipes.length > 0 ? [...lunchRecipes] : [...recipes];
      
      day.meals[1].recipe = lunchPool[Math.floor(Math.random() * lunchPool.length)];
      if (day.meals[1].recipe) {
        usedRecipes.add(day.meals[1].recipe.id);
        if (day.meals[1].recipe.mainIngredient) {
          usedMainIngredients.add(day.meals[1].recipe.mainIngredient);
        }
      }
      
      // 晚餐 - 周末选择更复杂的料理
      let dinnerPool = dinnerRecipes.length > 0 ? [...dinnerRecipes] : [...recipes];
      dinnerPool = dinnerPool.filter(r => !usedRecipes.has(r.id));
      // 尝试避免主料重复
      const dinnerPoolNonDuplicate = dinnerPool.filter(r => 
        !r.mainIngredient || !usedMainIngredients.has(r.mainIngredient)
      );
      if (dinnerPoolNonDuplicate.length > 0) dinnerPool = dinnerPoolNonDuplicate;
      
      if (isWeekend) {
        // 周末筛选更复杂的料理（通过食材数量判断）
        const complexRecipes = dinnerPool.filter(r => r.ingredients && r.ingredients.length >= 5);
        if (complexRecipes.length > 0) {
          dinnerPool = complexRecipes;
        }
      }
      
      if (dinnerPool.length === 0) dinnerPool = dinnerRecipes.length > 0 ? [...dinnerRecipes] : [...recipes];
      
      day.meals[2].recipe = dinnerPool[Math.floor(Math.random() * dinnerPool.length)];
      if (day.meals[2].recipe) {
        usedRecipes.add(day.meals[2].recipe.id);
        if (day.meals[2].recipe.mainIngredient) {
          usedMainIngredients.add(day.meals[2].recipe.mainIngredient);
        }
      }
    });
    
    setWeeklyPlan(newPlan);
    
    // 清空主料输入
    setInputMainIngredients('');
  };

  // 随机生成周计划
  const generateRandomPlan = () => {
    if (recipes.length === 0) return;
    
    const breakfastRecipes = recipes.filter(r => r.category === '早餐');
    const lunchRecipes = recipes.filter(r => r.category === '午餐' || r.category === '主菜');
    const dinnerRecipes = recipes.filter(r => r.category === '晚餐' || r.category === '主菜');
    
    const newPlan = weeklyPlan.map(day => ({
      ...day,
      meals: day.meals.map(meal => {
        let recipePool = [];
        
        if (meal.type === '早餐') {
          recipePool = breakfastRecipes.length > 0 ? breakfastRecipes : recipes;
        } else if (meal.type === '午餐') {
          recipePool = lunchRecipes.length > 0 ? lunchRecipes : recipes;
        } else if (meal.type === '晚餐') {
          recipePool = dinnerRecipes.length > 0 ? dinnerRecipes : recipes;
        }
        
        return {
          ...meal,
          recipe: recipePool.length > 0 
            ? recipePool[Math.floor(Math.random() * recipePool.length)] 
            : null
        };
      })
    }));
    
    setWeeklyPlan(newPlan);
    
    // 清空主料输入
    setInputMainIngredients('');
  };

  if (loading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (recipes.length === 0) {
    return (
      <div className="center-container">
        <p className="text-gray-500 mb-2">暂无食谱，请先添加一些食谱</p>
        <button 
          onClick={() => window.location.hash = '#recipes'}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          去添加食谱
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">一周餐饮计划</h3>
        <div className="button-container">
          <button 
            onClick={handleSmartPlanClick}
            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
            title="智能生成会避免主料重复，周末安排更丰富的菜品"
            disabled={recipes.length === 0}
          >
            智能生成计划
          </button>
          <button 
            onClick={generateRandomPlan}
            className="bg-gray-500 text-white px-3 py-1 rounded mr-2 hover:bg-gray-600"
            disabled={recipes.length === 0}
          >
            随机生成计划
          </button>
          <button 
            onClick={() => onGenerateShoppingList && onGenerateShoppingList(weeklyPlan)}
            className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
          >
            生成购物清单
          </button>
          <button 
            onClick={handlePrintWeeklyPlan}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            title="打印当前计划"
          >
            打印菜单
          </button>
        </div>
      </div>
      
      {/* 主料输入框 */}
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <div className="mb-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            指定优先使用的主料（可选，用逗号分隔）:
          </label>
          <div className="flex">
            <input
              type="text"
              value={inputMainIngredients}
              onChange={handleMainIngredientInputChange}
              className="flex-grow p-2 border rounded mr-2"
              placeholder="例如: 牛肉，鸡肉，猪肉，虾"
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            提示：指定主料后点击"智能生成计划"，系统会优先使用这些主料生成菜单。支持中英文逗号，不区分大小写。
          </div>
          <div className="mt-1 text-xs text-gray-500">
            系统中已有主料: {availableMainIngredients.join('、')}
          </div>
        </div>
      </div>
      
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">日期</th>
            <th className="border p-2">早餐</th>
            <th className="border p-2">午餐</th>
            <th className="border p-2">晚餐</th>
          </tr>
        </thead>
        <tbody>
          {weeklyPlan.map((day, dayIndex) => (
            <tr key={day.day}>
            <td className="border p-2 font-semibold">{day.day}</td>
            {day.meals.map((meal, mealIndex) => (
              <td key={meal.type} className="border p-2">
                <select
                  value={meal.recipe ? meal.recipe.id : ''}
                  onChange={(e) => {
                    const selectedRecipe = e.target.value 
                      ? recipes.find(r => r.id === e.target.value) 
                      : null;
                    handleSelectRecipe(dayIndex, mealIndex, selectedRecipe);
                  }}
                  className="w-full p-1 border rounded no-print"
                >
                  <option value="">选择食谱</option>
                  {recipes
                    .filter(r => 
                      meal.type === '早餐' ? r.category === '早餐' || r.category === '通用' :
                      meal.type === '午餐' ? r.category === '午餐' || r.category === '主菜' || r.category === '通用' :
                      r.category === '晚餐' || r.category === '主菜' || r.category === '通用'
                    )
                    .map(recipe => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))
                  }
                </select>
                {meal.recipe && (
                  <div className="text-sm mt-1">
                    <div className="font-medium">
                      {meal.recipe.name}
                    </div>
                    <div className="text-gray-600">
                      {meal.recipe.prepTime && `准备时间: ${meal.recipe.prepTime}`}
                    </div>
                    
                    {/* 显示主料信息 */}
                    {meal.recipe.mainIngredient && (
                      <div className="text-gray-600">
                        主料: {meal.recipe.mainIngredient}
                      </div>
                    )}
                    
                    {/* 视频链接 */}
                    {meal.recipe.videoLink && (
                      <div className="mt-1 no-print">
                        <a 
                          href={meal.recipe.videoLink.startsWith('http') ? meal.recipe.videoLink : `https://${meal.recipe.videoLink}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm hover:underline"
                        >
                          观看教程视频
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

export default WeeklyPlan;