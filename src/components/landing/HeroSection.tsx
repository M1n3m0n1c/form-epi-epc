import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Smartphone, Users } from 'lucide-react';

interface HeroSectionProps {
  onNavigateToAdmin: () => void;
}

export const HeroSection = ({ onNavigateToAdmin }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-primary/5 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              {/* Logo Section */}
              <div className="flex items-center space-x-6">
                <img
                  src="/app-logo.png"
                  alt="Logo do Sistema"
                  className="h-16 w-auto"
                />
                <div className="h-12 w-px bg-border"></div>
                <img
                  src="/logo_tlf.png"
                  alt="Logo Telefônica"
                  className="h-16 w-auto"
                />
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  <span className="block">SISFEE</span>
                  <span className="block text-primary text-4xl lg:text-5xl font-semibold mt-2">
                    Sistema de Formulário EPI/EPC
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  A solução mais avançada para inspeção e controle de Equipamentos de Proteção Individual (EPI)
                  e Equipamentos de Proteção Coletiva (EPC) com anexo de fotos integrado.
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Segurança</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Mobile</p>
                    <p className="text-sm text-muted-foreground">Otimizado</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Equipes</p>
                    <p className="text-sm text-muted-foreground">Conectadas</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  onClick={onNavigateToAdmin}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Acessar Painel Administrativo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-card-foreground">
                        Inspeção EPI/EPC
                      </h3>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Formulários Ativos</span>
                        <span className="font-semibold text-primary">24</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Concluídos Hoje</span>
                        <span className="font-semibold text-green-600">18</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Taxa de Aprovação</span>
                        <span className="font-semibold text-blue-600">94%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
