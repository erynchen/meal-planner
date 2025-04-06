import React, { useState } from 'react';

const Settings = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('claude_api_key') || '';
  });
  const [saved, setSaved] = useState(false);

  const handleSaveApiKey = () => {
    localStorage.setItem('claude_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">设置</h3>
      <div className="bg-white p-4 border rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Claude API密钥
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="sk_ant_..."
          />
          <p className="text-xs text-gray-500 mt-1">
            AI菜单生成功能需要Claude API密钥。您可以在Anthropic控制台获取自己的密钥。
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleSaveApiKey}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
          >
            保存密钥
          </button>
          {saved && (
            <span className="ml-3 text-green-500 text-sm">已保存!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;