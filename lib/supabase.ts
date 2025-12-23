import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取配置
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Please check your .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);