import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  phone?: string;
  city?: string;
  province?: string;
  avatarUrl?: string;
  createdAt?: Date;
}

// 用户状态store
export const user = writable<User | null>(null);

// 登录状态store
export const isLoggedIn = writable<boolean>(false);

// 加载状态store
export const isLoading = writable<boolean>(false);

// 获取token
const getToken = () => {
  if (!browser) return null;
  return localStorage.getItem('token');
};

// 设置token
const setToken = (token: string) => {
  if (!browser) return;
  localStorage.setItem('token', token);
};

// 移除token
const removeToken = () => {
  if (!browser) return;
  localStorage.removeItem('token');
};

// 初始化用户状态（仅在浏览器端执行）
export const initializeAuth = async () => {
  if (!browser) return;
  
  const token = getToken();
  if (!token) {
    user.set(null);
    isLoggedIn.set(false);
    return;
  }
  
  isLoading.set(true);
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      user.set(userData);
      isLoggedIn.set(true);
    } else {
      // Token无效，清除
      removeToken();
      user.set(null);
      isLoggedIn.set(false);
    }
  } catch (error) {
    console.error('初始化认证状态失败:', error);
    removeToken();
    user.set(null);
    isLoggedIn.set(false);
  } finally {
    isLoading.set(false);
  }
};

// 登录函数 - 支持新的智能登录API
export const login = async (account: string, password: string, accountType: string = 'email') => {
  isLoading.set(true);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        account, 
        accountType, 
        password, 
        loginType: 'password' 
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // 保存token
      setToken(data.token);
      user.set(data.user);
      isLoggedIn.set(true);
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.message || '登录失败' };
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    return { success: false, error: '网络错误，请稍后重试' };
  } finally {
    isLoading.set(false);
  }
};

// 兼容旧的登录接口
export const loginWithEmail = async (email: string, password: string) => {
  return login(email, password, 'email');
};

// 注册函数
export const register = async (userData: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}) => {
  isLoading.set(true);
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // 保存token
      if (data.token) {
        setToken(data.token);
      }
      user.set(data.user);
      isLoggedIn.set(true);
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.message || '注册失败' };
    }
  } catch (error) {
    console.error('注册请求失败:', error);
    return { success: false, error: '网络错误，请稍后重试' };
  } finally {
    isLoading.set(false);
  }
};

// 登出函数
export const logout = async () => {
  removeToken();
  user.set(null);
  isLoggedIn.set(false);
};

// 检查用户权限
export const hasRole = (requiredRole: string | string[], userRole?: string) => {
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

// 检查是否为管理员
export const isAdmin = (userRole?: string) => {
  return hasRole(['ADMIN', 'CUSTOMER_SERVICE', 'PRODUCT_MANAGER'], userRole);
};

// 获取当前用户信息
export async function getCurrentUser() {
  const token = getToken();
  if (!token) {
    user.set(null);
    return null;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      user.set(userData);
      return userData;
    } else {
      removeToken();
      user.set(null);
      return null;
    }
  } catch (err) {
    console.error('获取用户信息失败:', err);
    removeToken();
    user.set(null);
    return null;
  }
}

// 检查用户权限
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'USER': 0,
    'CUSTOMER_SERVICE': 1,
    'PRODUCT_MANAGER': 2,
    'ADMIN': 3
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

// 注释掉自动初始化，改为手动初始化
// if (browser) {
//   initializeAuth();
// } 