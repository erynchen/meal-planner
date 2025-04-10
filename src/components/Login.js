import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // You can change this password to anything you want
  const correctPassword = '111';
  
  const handleSubmit = (e) => {
    e.preventDefault();ß
    
    if (password === correctPassword) {
      // Store in localStorage so the user stays logged in
      localStorage.setItem('isLoggedIn', 'true');
      onLogin();
    } else {
      setError('密码不正确，请重试');
      setPassword('');
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">家庭餐饮管理系统</h2>
      <p className="text-center mb-6 text-gray-600">请输入密码访问您的食谱和餐饮计划</p>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            密码
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          登录
        </button>
      </form>
    </div>
  );
};

export default Login;