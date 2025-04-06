import React from 'react';

const NavBar = ({ activeTab, onTabChange, hasSettings = false }) => {
  console.log("NavBar渲染，当前activeTab:", activeTab);

  return (
    <div className="flex border-b mb-4">
      <button
        className={`py-2 px-4 mr-2 ${activeTab === 'recipes' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
        onClick={() => onTabChange('recipes')}
      >
        食谱管理
      </button>
      <button
        className={`py-2 px-4 mr-2 ${activeTab === 'weekly-plan' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
        onClick={() => onTabChange('weekly-plan')}
      >
        周计划
      </button>
      <button
        className={`py-2 px-4 mr-2 ${activeTab === 'shopping' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
        onClick={() => onTabChange('shopping')}
      >
        购物清单
      </button>
      {hasSettings && (
        <button
          className={`py-2 px-4 ml-auto ${activeTab === 'settings' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
          onClick={() => onTabChange('settings')}
        >
          设置
        </button>
      )}
    </div>
  );
};

export default NavBar;