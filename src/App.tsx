import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { testConnection } from '@/lib/supabase/client';
import AdminPage from '@/pages/admin';
import { useEffect, useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      setSupabaseConnected(isConnected);
    };

    checkConnection();
  }, []);

  if (currentPage === 'admin') {
    return <AdminPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='max-w-4xl mx-auto space-y-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>
            Sistema de Formulário EPI/EPC
          </h1>
          <p className='text-muted-foreground mt-2'>
            Projeto configurado com sucesso! 🎉
          </p>
        </div>

        <div className='flex justify-center'>
          <Button
            onClick={() => setCurrentPage('admin')}
            size="lg"
            className='bg-blue-600 hover:bg-blue-700'
          >
            🔐 Acessar Painel Administrativo
          </Button>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Contador</CardTitle>
              <CardDescription>Teste de componente Button</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-2xl font-bold text-center'>{count}</div>
              <div className='flex gap-2 justify-center'>
                <Button onClick={() => setCount(count - 1)} variant='outline'>
                  Diminuir
                </Button>
                <Button onClick={() => setCount(count + 1)}>Aumentar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formulário</CardTitle>
              <CardDescription>
                Teste de componentes Input e Label
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome</Label>
                <Input
                  id='name'
                  placeholder='Digite seu nome'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              {name && (
                <div className='p-4 bg-muted rounded-lg'>
                  <p className='text-sm'>
                    Olá, <strong>{name}</strong>! 👋
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status da Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Vite configurado</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ React + TypeScript</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Tailwind CSS v4</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Shadcn/UI instalado</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Componentes funcionando</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className={`w-2 h-2 rounded-full ${
                  supabaseConnected === null
                    ? 'bg-yellow-500'
                    : supabaseConnected
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}></div>
                <span>
                  {supabaseConnected === null
                    ? '⏳ Testando conexão Supabase...'
                    : supabaseConnected
                    ? '✅ Supabase conectado'
                    : '❌ Erro na conexão Supabase'
                  }
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Layout administrativo criado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
