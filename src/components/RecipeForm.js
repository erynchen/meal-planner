import React, { useState } from 'react';
import { addRecipe } from '../services/recipeService';

const RecipeForm = ({ onRecipeAdded }) => {
  const [recipe, setRecipe] = useState({
    name: '',
    category: '主菜',
    mainIngredient: '', // 新增主料字段
    ingredients: '',
    instructions: '',
    prepTime: '',
    videoLink: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (recipe.name.trim() === '') return;
    
    // 处理配料列表
    const ingredientsList = recipe.ingredients
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    const recipeToAdd = {
      ...recipe,
      ingredients: ingredientsList,
      createdAt: new Date()
    };
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const addedRecipe = await addRecipe(recipeToAdd);
      
      // 重置表单
      setRecipe({
        name: '',
        category: '主菜',
        mainIngredient: '', // 清空主料
        ingredients: '',
        instructions: '',
        prepTime: '',
        videoLink: '',
      });
      
      if (onRecipeAdded) {
        onRecipeAdded(addedRecipe);
      }
    } catch (error) {
      console.error("添加食谱失败", error);
      setError("添加食谱失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">添加新食谱</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">食谱名称</label>
          <input
            type="text"
            name="name"
            value={recipe.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="例如：西红柿炒鸡蛋"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">分类</label>
          <select
            name="category"
            value={recipe.category}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="早餐">早餐</option>
            <option value="午餐">午餐</option>
            <option value="晚餐">晚餐</option>
            <option value="主菜">主菜（适用于午餐和晚餐）</option>
            <option value="配菜">配菜</option>
            <option value="汤">汤</option>
            <option value="甜点">甜点</option>
            <option value="通用">通用（任何餐点）</option>
          </select>
        </div>
        
        {/* 添加主料输入字段 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">主料</label>
          <input
            type="text"
            name="mainIngredient"
            value={recipe.mainIngredient}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="例如：牛肉、鸡肉、鱼等"
          />
          <p className="text-xs text-gray-500 mt-1">
            输入菜品的主要食材，如牛肉、鸡肉、鱼等。
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">准备时间</label>
          <input
            type="text"
            name="prepTime"
            value={recipe.prepTime}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="例如：30分钟"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">视频链接</label>
          <input
            type="url"
            name="videoLink"
            value={recipe.videoLink}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="例如：https://youtube.com/watch?v=xxxx"
          />
          <p className="text-xs text-gray-500 mt-1">
            可选。添加油管视频或食谱网站链接。
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">配料（用逗号分隔）</label>
          <textarea
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="例如：西红柿,鸡蛋,食用油,盐"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">烹饪步骤</label>
          <textarea
            name="instructions"
            value={recipe.instructions}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="输入详细的烹饪步骤..."
            rows="4"
          />
        </div>
        
        <div className="button-container">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? '添加中...' : '添加食谱'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;