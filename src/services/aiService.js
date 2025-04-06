import axios from 'axios';

// 从localStorage获取API密钥
const getClaudeApiKey = () => {
  return localStorage.getItem('claude_api_key');
};

// 从食谱库生成菜单
export const generateMenuFromRecipes = async (recipes) => {
  try {
    // 准备发送给Claude的食谱数据
    const recipeData = recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients
    }));

    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      throw new Error("未设置Claude API密钥，请先在设置中添加API密钥");
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `以下是我所有的食谱列表，每个食谱包含ID、名称、类别和主要食材：${JSON.stringify(recipeData)}
            
            请为我安排一周三餐(早餐、午餐、晚餐)的计划，必须只使用上面提供的食谱。返回格式要求：
            1. 使用JSON格式
            2. 为每天的每餐指定一个食谱ID
            3. 确保营养均衡，避免连续几天重复相同食谱
            4. 考虑食谱类别与餐点匹配（早餐食谱用于早餐等）
            5. 周末(周六周日)可以安排更复杂的料理
            
            请确保返回的JSON格式如下：
            {
              "monday": {
                "breakfast": "recipe_id",
                "lunch": "recipe_id",
                "dinner": "recipe_id"
              },
              ... (其他日期)
            }`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    let aiPlan;
    
    try {
      // 解析Claude返回的JSON数据
      // Claude会在response.data.content中返回内容
      const content = response.data.content[0].text;
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("无法从Claude响应中提取JSON");
      }
    } catch (e) {
      console.error("Claude返回内容解析失败:", e);
      throw new Error("无法解析Claude的响应，请稍后再试");
    }
    
    // 转换为应用可用的格式
    return convertAIPlanToAppFormat(aiPlan, recipes);
  } catch (error) {
    console.error("AI生成菜单失败:", error);
    throw error;
  }
};

// 将AI返回的计划转换为应用可用的格式
function convertAIPlanToAppFormat(aiPlan, allRecipes) {
  // 映射英文与中文日期
  const dayTranslate = {
    'monday': '周一',
    'tuesday': '周二',
    'wednesday': '周三',
    'thursday': '周四',
    'friday': '周五',
    'saturday': '周六',
    'sunday': '周日'
  };
  
  // 创建应用所需的格式
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const appFormat = days.map(day => {
    const dayData = aiPlan[day];
    return {
      day: dayTranslate[day],
      meals: [
        {
          type: '早餐',
          recipe: dayData?.breakfast ? findRecipeById(dayData.breakfast, allRecipes) : null
        },
        {
          type: '午餐',
          recipe: dayData?.lunch ? findRecipeById(dayData.lunch, allRecipes) : null
        },
        {
          type: '晚餐',
          recipe: dayData?.dinner ? findRecipeById(dayData.dinner, allRecipes) : null
        }
      ]
    };
  });
  
  return appFormat;
}

// 通过ID查找食谱
function findRecipeById(id, recipes) {
  return recipes.find(recipe => recipe.id === id) || null;
}