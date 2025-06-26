import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente sem tipos para testes (evita problemas com banco vazio)
const supabaseTest = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão
export const testConnection = async () => {
  try {
    // Tenta consultar uma tabela inexistente - se retornar erro 404, a conexão está OK
    const { error } = await supabaseTest.from('test').select('*').limit(1);

    // Se o erro for relacionado à tabela não existir, significa que a conexão está funcionando
    if (error && (
      error.code === 'PGRST116' || // Tabela não encontrada
      error.code === '42P01' ||    // Tabela não existe (PostgreSQL)
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('not found')
    )) {
      return true;
    }

    // Se não houver erro, também significa que está funcionando
    if (!error) {
      return true;
    }

    // Se chegou até aqui, há um erro real de conexão
    console.error('Erro na conexão com Supabase:', error);
    return false;
  } catch (err) {
    console.error('❌ Falha na conexão com Supabase:', err);
    return false;
  }
};

export default supabase;
