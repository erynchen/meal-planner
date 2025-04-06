import React, { useState, useEffect } from 'react';
import { getAllRecipes, deleteRecipe } from '../services/recipeService';
import EditRecipeForm from './EditRecipeForm';

const RecipeList = ({ onDeleteRecipe, refreshTrigger, onRecipeUpdated }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  
  // 新增过滤相关状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMainIngredient, setFilterMainIngredient] = useState(''); // 添加主料过滤

  useEffect(() => {
    loadRecipes();
  }, [refreshTrigger]); // 当refreshTrigger变化时重新加载食谱

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("正在从Firestore获取食谱列表...");
      const recipesData = await getAllRecipes();
      console.log("获取到的食谱列表:", recipesData);
      setRecipes(recipesData);
    } catch (error) {
      console.error("加载食谱失败", error);
      setError("加载食谱失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm('确定要删除这个食谱吗？')) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        if (onDeleteRecipe) {
          onDeleteRecipe(id);
        }
      } catch (error) {
        console.error("删除食谱失败", error);
        alert("删除食谱失败，请稍后再试");
      }
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes(
      recipes.map(recipe => 
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    );
    setEditingRecipe(null);
    
    if (onRecipeUpdated) {
      onRecipeUpdated(updatedRecipe);
    }
  };

  // 格式化视频链接，确保可以正确打开
  const formatVideoLink = (link) => {
    if (!link) return null;
    
    // 如果链接不包含协议，添加https://
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return `https://${link}`;
    }
    
    return link;
  };

  // 生成视频平台图标
  const getVideoIcon = (link) => {
    if (!link) return null;
    
    const linkLower = link.toLowerCase();
    
    if (linkLower.includes('youtube') || linkLower.includes('youtu.be')) {
      return '📺 YouTube';
    } else if (linkLower.includes('bilibili')) {
      return '📺 哔哩哔哩';
    } else if (linkLower.includes('douyin') || linkLower.includes('tiktok')) {
      return '📱 抖音/TikTok';
    } else {
      return '🔗 视频教程';
    }
  };

  // 获取所有不重复的主料，用于过滤选项
  const allMainIngredients = Array.from(
    new Set(
      recipes
        .filter(recipe => recipe.mainIngredient)
        .map(recipe => recipe.mainIngredient)
    )
  ).sort();

  // 过滤食谱
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || recipe.category === filterCategory;
    const matchesMainIngredient = 
      filterMainIngredient === '' || 
      (recipe.mainIngredient && recipe.mainIngredient === filterMainIngredient);
    
    return matchesSearch && matchesCategory && matchesMainIngredient;
  });

  if (loading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  // 如果正在编辑食谱，显示编辑表单
  if (editingRecipe) {
    return (
      <EditRecipeForm 
        recipe={editingRecipe} 
        onCancel={handleCancelEdit}
        onRecipeUpdated={handleRecipeUpdated}
      />
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">我的食谱</h3>
      
      {/* 搜索和过滤功能 */}
      <div className="mb-4 flex flex-wrap items-center">
        <div className="mr-4 mb-2">
          <input
            type="text"
            placeholder="搜索食谱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div className="mr-4 mb-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">所有分类</option>
            <option value="早餐">早餐</option>
            <option value="午餐">午餐</option>
            <option value="晚餐">晚餐</option>
            <option value="主菜">主菜</option>
            <option value="配菜">配菜</option>
            <option value="汤">汤</option>
            <option value="甜点">甜点</option>
            <option value="通用">通用</option>
          </select>
        </div>
        <div className="mb-2">
          <select
            value={filterMainIngredient}
            onChange={(e) => setFilterMainIngredient(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">所有主料</option>
            {allMainIngredients.map(ingredient => (
              <option key={ingredient} value={ingredient}>
                {ingredient}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredRecipes.length === 0 ? (
        <p className="text-gray-500 center-container">
          {recipes.length === 0 ? '暂无食谱，请添加您的第一个食谱。' : '没有符合过滤条件的食谱。'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="card">
              <div className="flex justify-between items-start">
                <h4 className="font-bold">{recipe.name}</h4>
                <div>
                  <button 
                    onClick={() => handleEditRecipe(recipe)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                    title="编辑"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="text-red-500 hover:text-red-700"
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">分类: {recipe.category}</p>
              
              {/* 显示主料信息 */}
              {recipe.mainIngredient && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">主料:</span> {recipe.mainIngredient}
                </p>
              )}
              
              <p className="text-sm text-gray-600 mb-2">准备时间: {recipe.prepTime}</p>
              
              {/* 显示视频链接（如果有） */}
              {recipe.videoLink && (
                <p className="mb-2">
                  <a 
                    href={formatVideoLink(recipe.videoLink)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 hover:underline flex items-center"
                  >
                    {getVideoIcon(recipe.videoLink)}
                  </a>
                </p>
              )}
              
              <div className="mb-2">
                <p className="text-sm font-semibold">配料:</p>
                <ul className="text-sm pl-5 list-disc">
                  {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                    <li key={idx}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm font-semibold">烹饪步骤:</p>
              <p className="text-sm">{recipe.instructions}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;