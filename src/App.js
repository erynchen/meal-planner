import React, { useState } from 'react';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import WeeklyPlan from './components/WeeklyPlan';
import ShoppingList from './components/ShoppingList';
import Settings from './components/Settings';
import NavBar from './components/NavBar';

function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState(null);

  const handleRecipeAdded = () => {
    // 触发食谱列表刷新
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRecipeUpdated = () => {
    // 触发食谱列表刷新
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleGenerateShoppingList = (plan) => {
    setWeeklyPlan(plan);
    setActiveTab('shopping');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">家庭餐饮管理系统</h1>
      
      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {activeTab === 'recipes' && (
        <div>
          <RecipeForm onRecipeAdded={handleRecipeAdded} />
          <RecipeList 
            refreshTrigger={refreshTrigger} 
            onDeleteRecipe={handleRecipeAdded} 
            onRecipeUpdated={handleRecipeUpdated}
          />
        </div>
      )}
      
      {activeTab === 'weekly-plan' && (
        <WeeklyPlan onGenerateShoppingList={handleGenerateShoppingList} />
      )}
      
      {activeTab === 'shopping' && (
        <ShoppingList weeklyPlan={weeklyPlan} />
      )}
      
      {activeTab === 'settings' && (
        <Settings />
      )}
    </div>
  );
}

export default App;