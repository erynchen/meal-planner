import React, { useState, useEffect, useCallback } from 'react';

const ShoppingList = ({ weeklyPlan }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [categoryView, setCategoryView] = useState(false); // 是否按类别分组显示

  // 使用useCallback包装generateShoppingList函数
  const generateShoppingList = useCallback(() => {
    if (!weeklyPlan) return;
    
    // 收集所有计划中用到的配料
    const ingredientsMap = {};
    
    // 用于记录配料来源（哪些菜用到了这个配料）
    const ingredientSources = {}; 
    
    weeklyPlan.forEach(day => {
      day.meals.forEach(meal => {
        if (meal.recipe && meal.recipe.ingredients) {
          meal.recipe.ingredients.forEach(ingredient => {
            // 规范化配料名称（去除首尾空格，转小写）
            const normalizedIngredient = ingredient.trim().toLowerCase();
            
            // 更新数量和来源
            ingredientsMap[normalizedIngredient] = (ingredientsMap[normalizedIngredient] || 0) + 1;
            
            // 记录来源
            if (!ingredientSources[normalizedIngredient]) {
              ingredientSources[normalizedIngredient] = [];
            }
            
            // 在来源中添加这道菜（如果尚未添加）
            const recipeName = meal.recipe.name;
            if (!ingredientSources[normalizedIngredient].includes(recipeName)) {
              ingredientSources[normalizedIngredient].push(recipeName);
            }
          });
        }
      });
    });
    
    // 尝试对配料进行分类
    const categories = {
      "肉类": ["肉", "牛肉", "猪肉", "羊肉", "鸡肉", "鸭肉", "鸡", "鸭", "牛", "猪", "羊", "火腿", "香肠", "培根"],
      "海鲜": ["鱼", "虾", "蟹", "贝", "海鲜", "带鱼", "三文鱼", "鳕鱼", "金枪鱼"],
      "蔬菜": ["菜", "青菜", "白菜", "西兰花", "花椰菜", "芦笋", "茄子", "番茄", "西红柿", "黄瓜", "胡萝卜", "土豆", "洋葱", "南瓜", "蘑菇", "菠菜", "生菜", "韭菜", "香菜", "蒜", "姜", "葱"],
      "水果": ["果", "苹果", "香蕉", "橙子", "桔子", "柠檬", "梨", "葡萄", "西瓜", "草莓", "蓝莓", "桃"],
      "米面粮油": ["米", "面", "粉", "面条", "通心粉", "意面", "方便面", "挂面", "米粉", "面包", "吐司", "油", "橄榄油", "色拉油", "食用油", "芝麻油"],
      "调味品": ["盐", "糖", "酱", "醋", "料酒", "酱油", "蚝油", "豆瓣酱", "甜面酱", "番茄酱", "辣椒酱", "辣椒", "花椒", "胡椒", "八角", "桂皮", "香叶", "香料", "调料"],
      "豆制品": ["豆腐", "豆干", "豆皮", "腐竹", "豆", "豆芽"],
      "蛋奶类": ["蛋", "奶", "酸奶", "奶酪", "黄油", "芝士", "乳酪"],
      "干货": ["干", "木耳", "香菇", "银耳", "枸杞", "红枣", "桂圆", "莲子"],
      "零食饮料": ["饮料", "果汁", "可乐", "雪碧", "汽水", "啤酒", "酒", "零食", "饼干", "薯片", "巧克力"]
    };
    
    // 将配料分类
    const categorizedIngredients = {};
    Object.keys(categories).forEach(category => {
      categorizedIngredients[category] = [];
    });
    categorizedIngredients["其他"] = []; // 未分类项
    
    // 转换成列表格式并分类
    const list = Object.entries(ingredientsMap).map(([ingredient, count]) => {
      const item = {
        ingredient,
        count,
        checked: false,
        sources: ingredientSources[ingredient] || []
      };
      
      // 尝试分类
      let categorized = false;
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => ingredient.includes(keyword))) {
          categorizedIngredients[category].push(item);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categorizedIngredients["其他"].push(item);
      }
      
      return item;
    });
    
    // 按配料名称排序
    Object.keys(categorizedIngredients).forEach(category => {
      categorizedIngredients[category].sort((a, b) => a.ingredient.localeCompare(b.ingredient, 'zh-CN'));
    });
    
    // 更新状态
    setShoppingList(list);
    
    // 保存分类的购物清单
    sessionStorage.setItem('categorizedShoppingList', JSON.stringify(categorizedIngredients));
  }, [weeklyPlan]); // 添加weeklyPlan作为依赖项

  useEffect(() => {
    if (weeklyPlan) {
      generateShoppingList();
    }
  }, [weeklyPlan, generateShoppingList]); // 修复依赖项

  // 切换购物清单项的检查状态
  const toggleShoppingItem = (ingredient) => {
    setShoppingList(prevList => 
      prevList.map(item => 
        item.ingredient === ingredient 
          ? { ...item, checked: !item.checked } 
          : item
      )
    );
    
    // 同时更新存储的分类购物清单
    const categorizedList = JSON.parse(sessionStorage.getItem('categorizedShoppingList') || '{}');
    Object.keys(categorizedList).forEach(category => {
      categorizedList[category] = categorizedList[category].map(item => 
        item.ingredient === ingredient 
          ? { ...item, checked: !item.checked } 
          : item
      );
    });
    sessionStorage.setItem('categorizedShoppingList', JSON.stringify(categorizedList));
  };
  
  // 切换显示模式
  const toggleViewMode = () => {
    setCategoryView(!categoryView);
  };
  
  // 按类别渲染购物清单
  const renderCategorizedList = () => {
    const categorizedList = JSON.parse(sessionStorage.getItem('categorizedShoppingList') || '{}');
    
    return (
      <div>
        {Object.entries(categorizedList).map(([category, items]) => {
          // 如果这个类别没有配料，不显示
          if (items.length === 0) return null;
          
          return (
            <div key={category} className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
              <ul>
                {items.map((item) => (
                  <li key={item.ingredient} className="mb-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={() => toggleShoppingItem(item.ingredient)}
                      className="mr-2"
                    />
                    <span className={item.checked ? "line-through text-gray-500" : ""}>
                      <span className="font-medium">{item.ingredient}</span>
                      {item.count > 1 && (
                        <span className="text-sm text-gray-500"> (x{item.count})</span>
                      )}
                      <span className="text-xs text-gray-500 ml-2">
                        {item.sources && item.sources.length > 0 && `用于: ${item.sources.join(', ')}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };
  
  // 按字母表顺序渲染购物清单
  const renderAlphabeticalList = () => {
    // 按字母表排序
    const sortedList = [...shoppingList].sort((a, b) => 
      a.ingredient.localeCompare(b.ingredient, 'zh-CN')
    );
    
    return (
      <ul>
        {sortedList.map((item) => (
          <li key={item.ingredient} className="mb-2 flex items-center">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleShoppingItem(item.ingredient)}
              className="mr-2"
            />
            <span className={item.checked ? "line-through text-gray-500" : ""}>
              <span className="font-medium">{item.ingredient}</span>
              {item.count > 1 && (
                <span className="text-sm text-gray-500"> (x{item.count})</span>
              )}
              <span className="text-xs text-gray-500 ml-2">
                {item.sources && item.sources.length > 0 && `用于: ${item.sources.join(', ')}`}
              </span>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">购物清单</h3>
      {shoppingList.length === 0 ? (
        <p className="text-gray-500 center-container">请先生成购物清单</p>
      ) : (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-600">共 {shoppingList.length} 种食材</span>
            </div>
            <div>
              <button 
                onClick={toggleViewMode}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
              >
                {categoryView ? "按名称排序" : "按类别分组"}
              </button>
            </div>
          </div>
          
          {categoryView ? renderCategorizedList() : renderAlphabeticalList()}
          
          {/* 打印功能 */}
          <div className="button-container mt-4">
            <button 
              onClick={() => window.print()}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              打印购物清单
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;