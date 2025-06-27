import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { Footer } from '@/components/shared/Footer';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminPage from '@/pages/admin';
import FormPage from '@/pages/form/[token]';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

// Componente Home separado para usar dentro do Router
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ThemeToggle />
      <div className="flex-1">
        <HeroSection onNavigateToAdmin={() => navigate('/admin')} />
        <FeaturesSection />
        <WorkflowSection />
      </div>
      <Footer />
    </div>
  );
}

// Wrapper do AdminPage para usar dentro do Router
function AdminPageWrapper() {
  return <AdminPage />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPageWrapper />} />
          <Route path="/form/:token" element={<FormPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
