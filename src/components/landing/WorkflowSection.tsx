import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowRight,
    BarChart3,
    Camera,
    FileText,
    Link,
    Monitor,
    Send,
    Smartphone
} from 'lucide-react';

export const WorkflowSection = () => {
  const adminSteps = [
    {
      icon: <Link className="w-6 h-6" />,
      title: "Geração",
      description: "Admin gera novo link de formulário",
      color: "bg-blue-500"
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: "Distribuição",
      description: "Link enviado via WhatsApp/Email",
      color: "bg-blue-600"
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Monitoramento",
      description: "Acompanha status em tempo real",
      color: "bg-blue-700"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Análise",
      description: "Visualiza respostas e exporta relatórios",
      color: "bg-blue-800"
    }
  ];

  const technicianSteps = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Acesso",
      description: "Técnico acessa via link direto",
      color: "bg-green-500"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Preenchimento",
      description: "Preenche formulário no dispositivo móvel",
      color: "bg-green-600"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Evidências",
      description: "Anexa fotos por seção do formulário",
      color: "bg-green-700"
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: "Envio",
      description: "Submete formulário completo com fotos",
      color: "bg-green-800"
    }
  ];

  const StepCard = ({ step, index, isLast }: { step: any, index: number, isLast: boolean }) => (
    <div className="flex items-center">
      <Card className="relative group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-6 h-6 ${step.color} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                  {index + 1}
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isLast && (
        <div className="hidden md:flex items-center mx-4">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Como Funciona o Sistema
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Fluxo de trabalho otimizado para máxima eficiência e controle
            </p>
          </div>

          {/* Admin Workflow */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-blue-700 flex items-center justify-center mb-2">
                <Monitor className="w-6 h-6 mr-2" />
                Processo Administrativo
              </h3>
              <p className="text-muted-foreground">
                Geração, distribuição e monitoramento de formulários
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
              {adminSteps.map((step, index) => (
                <StepCard
                  key={index}
                  step={step}
                  index={index}
                  isLast={index === adminSteps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Technician Workflow */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-700 flex items-center justify-center mb-2">
                <Smartphone className="w-6 h-6 mr-2" />
                Processo do Técnico
              </h3>
              <p className="text-muted-foreground">
                Acesso direto, preenchimento móvel e anexo de evidências
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
              {technicianSteps.map((step, index) => (
                <StepCard
                  key={index}
                  step={step}
                  index={index}
                  isLast={index === technicianSteps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/10 rounded-2xl p-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                Benefícios do Sistema Integrado
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Documentação Completa</h4>
                  <p className="text-sm text-muted-foreground">
                    Relatórios com evidências fotográficas integradas
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Controle Total</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitoramento em tempo real de todos os formulários
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Mobilidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Interface otimizada para trabalho em campo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
