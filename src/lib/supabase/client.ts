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

// Função para testar a conexão
export const testConnection = async () => {
  try {
    // Testa a conexão consultando uma tabela que existe (formularios)
    const { error } = await supabase.from('formularios').select('id').limit(1);

    // Se não houver erro, a conexão está funcionando
    if (!error) {
      return true;
    }

    // Se houver erro, verifica se é um erro de conexão real
    console.error('Erro na conexão com Supabase:', error);
    return false;
  } catch (err) {
    console.error('❌ Falha na conexão com Supabase:', err);
    return false;
  }
};

export default supabase;
