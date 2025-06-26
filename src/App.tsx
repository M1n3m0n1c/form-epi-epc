import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { testConnection } from '@/lib/supabase/client';
import AdminPage from '@/pages/admin';
import FormPage from '@/pages/form/[token]';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

// Componente Home separado para usar dentro do Router
function HomePage() {
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      setSupabaseConnected(isConnected);
    };

    checkConnection();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* Header Principal */}
        <div className='text-center space-y-4'>
          <div className='flex justify-center items-center space-x-4 mb-6'>
            <img
              src="/app-logo.png"
              alt="Logo do Sistema"
              className="h-16 w-auto"
            />
            <img
              src="/logo_tlf.png"
              alt="Logo Telefônica"
              className="h-12 w-auto"
            />
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 tracking-tight'>
            SISFEE
          </h1>
          <h2 className='text-2xl md:text-3xl font-semibold text-blue-700'>
            Sistema de Formulário EPI/EPC
          </h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            Solução para inspeção e controle de Equipamentos de Proteção Individual (EPI)
            e Equipamentos de Proteção Coletiva (EPC) com anexo de fotos integrado.
          </p>
        </div>

        {/* Botão de Acesso Principal */}
        <div className='flex justify-center'>
          <Button
            onClick={() => navigate('/admin')}
            size="lg"
            className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
          >
            🔐 Acessar Painel Administrativo
          </Button>
        </div>

        {/* Problema e Solução */}
        <div className='grid gap-6 md:grid-cols-2'>
          <Card className='border-red-200 bg-red-50'>
            <CardHeader>
              <CardTitle className='text-red-800 flex items-center'>
                🚨 Problema Atual
              </CardTitle>
            </CardHeader>
            <CardContent className='text-red-700'>
              <ul className='space-y-2 text-sm'>
                <li>• Formulários Microsoft Forms não permitem anexo de fotos</li>
                <li>• Técnicos enviam fotos separadamente por email</li>
                <li>• Relatórios finais ficam incompletos</li>
                <li>• Falta de evidências fotográficas integradas</li>
                <li>• Processo fragmentado e ineficiente</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='border-green-200 bg-green-50'>
            <CardHeader>
              <CardTitle className='text-green-800 flex items-center'>
                ✅ Nossa Solução
              </CardTitle>
            </CardHeader>
            <CardContent className='text-green-700'>
              <ul className='space-y-2 text-sm'>
                <li>• Anexo de fotos diretamente no formulário</li>
                <li>• Relatórios completos com evidências visuais</li>
                <li>• Interface otimizada para dispositivos móveis</li>
                <li>• Acesso via link único, sem necessidade de cadastro</li>
                <li>• Gestão centralizada no painel administrativo</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Histórias de Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl text-center text-gray-800'>
              👥 Quem Usa o Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-3'>
              {/* Administrador */}
              <div className='text-center space-y-3'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-2xl'>👨‍💼</span>
                </div>
                <h3 className='font-semibold text-blue-800'>Administrador</h3>
                <ul className='text-sm text-gray-600 space-y-1'>
                  <li>• Gera links únicos</li>
                  <li>• Monitora formulários</li>
                  <li>• Visualiza relatórios</li>
                  <li>• Exporta documentos</li>
                </ul>
              </div>

              {/* Técnico */}
              <div className='text-center space-y-3'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-2xl'>🔧</span>
                </div>
                <h3 className='font-semibold text-green-800'>Técnico de Campo</h3>
                <ul className='text-sm text-gray-600 space-y-1'>
                  <li>• Acessa via link direto</li>
                  <li>• Preenche no celular</li>
                  <li>• Anexa fotos por seção</li>
                  <li>• Sem necessidade de cadastro</li>
                </ul>
              </div>

              {/* Regional */}
              <div className='text-center space-y-3'>
                <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-2xl'>📊</span>
                </div>
                <h3 className='font-semibold text-purple-800'>Responsável Regional</h3>
                <ul className='text-sm text-gray-600 space-y-1'>
                  <li>• Recebe relatórios completos</li>
                  <li>• Avalia condições de segurança</li>
                  <li>• Analisa por período/empresa</li>
                  <li>• Toma decisões baseadas em dados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fluxo de Trabalho */}
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl text-center text-gray-800'>
              🔄 Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Fluxo Administrativo */}
              <div>
                <h3 className='font-semibold text-blue-800 mb-3 flex items-center'>
                  👨‍💼 Processo Administrativo
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>1</div>
                    <div className='text-sm'>
                      <strong>Geração:</strong> Admin gera novo link de formulário
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>2</div>
                    <div className='text-sm'>
                      <strong>Distribuição:</strong> Link enviado via WhatsApp/Email
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>3</div>
                    <div className='text-sm'>
                      <strong>Monitoramento:</strong> Acompanha status em tempo real
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>4</div>
                    <div className='text-sm'>
                      <strong>Análise:</strong> Visualiza respostas e exporta relatórios
                    </div>
                  </div>
                </div>
              </div>

              {/* Fluxo do Técnico */}
              <div>
                <h3 className='font-semibold text-green-800 mb-3 flex items-center'>
                  🔧 Processo do Técnico
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>1</div>
                    <div className='text-sm'>
                      <strong>Acesso:</strong> Clica no link recebido
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>2</div>
                    <div className='text-sm'>
                      <strong>Preenchimento:</strong> Responde seção por seção
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>3</div>
                    <div className='text-sm'>
                      <strong>Fotos:</strong> Anexa evidências de cada seção
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>4</div>
                    <div className='text-sm'>
                      <strong>Envio:</strong> Submete formulário completo
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>5</div>
                    <div className='text-sm'>
                      <strong>Confirmação:</strong> Recebe confirmação de sucesso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seções do Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl text-center text-gray-800'>
              📋 Seções do Formulário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <div className='p-4 bg-blue-50 rounded-lg'>
                <h4 className='font-semibold text-blue-800 mb-2'>1. Identificação</h4>
                <p className='text-sm text-gray-600'>Empresa, matrícula, nome, local, supervisor</p>
              </div>
              <div className='p-4 bg-green-50 rounded-lg'>
                <h4 className='font-semibold text-green-800 mb-2'>2. EPI Básico</h4>
                <p className='text-sm text-gray-600'>Capacete, óculos, protetor auricular, luvas, calçado, uniforme</p>
              </div>
              <div className='p-4 bg-yellow-50 rounded-lg'>
                <h4 className='font-semibold text-yellow-800 mb-2'>3. EPI Altura</h4>
                <p className='text-sm text-gray-600'>Cinto, talabarte, trava-quedas, mosquetão</p>
              </div>
              <div className='p-4 bg-red-50 rounded-lg'>
                <h4 className='font-semibold text-red-800 mb-2'>4. EPI Elétrico</h4>
                <p className='text-sm text-gray-600'>Luvas isolantes, mangote, tapete isolante</p>
              </div>
              <div className='p-4 bg-purple-50 rounded-lg'>
                <h4 className='font-semibold text-purple-800 mb-2'>5. Inspeção Geral</h4>
                <p className='text-sm text-gray-600'>Condições de uso, instruções, fornecimento</p>
              </div>
              <div className='p-4 bg-indigo-50 rounded-lg'>
                <h4 className='font-semibold text-indigo-800 mb-2'>6. Conclusão</h4>
                <p className='text-sm text-gray-600'>Responsável regional, observações, auto-avaliação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empresas Atendidas */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl text-center text-gray-800'>
              🏢 Empresas Atendidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap justify-center gap-4'>
              {['Icomon', 'Telequipe', 'Tel Telecomunicações', 'Eólen', 'Stein'].map((empresa) => (
                <span key={empresa} className='px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  {empresa}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl text-center text-gray-800'>
              ⚙️ Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2 text-sm max-w-2xl mx-auto'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Interface responsiva mobile-first</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Sistema de upload de fotos integrado</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Geração de links únicos</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>✅ Painel administrativo completo</span>
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
                    ? '⏳ Verificando conexão com banco de dados...'
                    : supabaseConnected
                    ? '✅ Banco de dados conectado'
                    : '❌ Erro na conexão com banco de dados'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center text-gray-500 text-sm pt-8'>
          <p>SISFEE - Sistema de Formulário EPI/EPC</p>
          <p>Desenvolvido por Marcelo Lara Diogo</p>
        </div>
      </div>
    </div>
  );
}

// Componente wrapper para AdminPage com navegação
function AdminPageWrapper() {
  const navigate = useNavigate();

  return <AdminPage onBack={() => navigate('/')} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPageWrapper />} />
        <Route path="/formulario/:token" element={<FormPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
