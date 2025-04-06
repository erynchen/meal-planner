import React, { useState } from 'react';
import { updateRecipe } from '../services/recipeService';

const EditRecipeForm = ({ recipe, onCancel, onRecipeUpdated }) => {
  const [editedRecipe, setEditedRecipe] = useState({
    ...recipe,
    mainIngredient: recipe.mainIngredient || '', // 确保主料字段存在
    ingredients: Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.join(', ') 
      : recipe.ingredients || '',
    videoLink: recipe.videoLink || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRecipe({
      ...editedRecipe,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editedRecipe.name.trim() === '') return;
    
    // 处理配料列表
    const ingredientsList = editedRecipe.ingredients
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    const recipeToUpdate = {
      ...editedRecipe,
      ingredients: ingredientsList,
      updatedAt: new Date()
    };
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedRecipe = await updateRecipe(recipe.id, recipeToUpdate);
      
      if (onRecipeUpdated) {
        onRecipeUpdated(updatedRecipe);
      }
    } catch (error) {
      console.error("更新食谱失败", error);
      setError("更新食谱失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">编辑食谱</h3>
      
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
            value={editedRecipe.name}
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
            value={editedRecipe.category}
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
            value={editedRecipe.mainIngredient}
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
            value={editedRecipe.prepTime}
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
            value={editedRecipe.videoLink}
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
            value={editedRecipe.ingredients}
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
            value={editedRecipe.instructions}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="输入详细的烹饪步骤..."
            rows="4"
          />
        </div>
        
        <div className="button-container">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
          >
            取消
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipeForm;