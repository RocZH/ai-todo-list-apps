import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// 从环境变量中获取配置
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  
  console.error(`Missing Supabase configuration. Please check your .env file for: ${missingVars.join(', ')}`);
  
  // 在开发环境中抛出错误，但在生产环境中仅记录警告
  if (__DEV__) {
    throw new Error(`Missing Supabase configuration: ${missingVars.join(', ')}`);
  }
}

// 创建Supabase客户端
export const supabase = createClient(
  supabaseUrl!, 
  supabaseAnonKey!,
  {
    // 添加调试选项，只在开发环境中启用
    global: {
      headers: {
        'X-Client-Info': `ai-todo-list-apps/${Platform.OS}`,
      },
    },
    auth: {
      // 配置认证选项
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // 在移动应用中通常不需要
    },
  }
);