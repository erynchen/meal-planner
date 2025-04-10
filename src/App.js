import React, { useState, useEffect } from 'react';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import WeeklyPlan from './components/WeeklyPlan';
import ShoppingList from './components/ShoppingList';
import Settings from './components/Settings';
import NavBar from './components/NavBar';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

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
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">家庭餐饮管理系统</h1>
        <button 
          onClick={handleLogout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
        >
          退出登录
        </button>
      </div>
      
      <NavBar activeTab={activeTab} onTabChange={handleTabChange} hasSettings={true} />
      
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