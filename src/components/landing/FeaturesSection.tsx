import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  FileText,
  Shield,
  Smartphone,
  Users,
  Zap
} from 'lucide-react';

export const FeaturesSection = () => {
  const problems = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Formulários Limitados",
      description: "Microsoft Forms não permite anexo de fotos"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Processo Fragmentado",
      description: "Técnicos enviam fotos separadamente por email"
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Relatórios Incompletos",
      description: "Falta de evidências fotográficas integradas"
    }
  ];

  const solutions = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Anexo Integrado",
      description: "Fotos diretamente no formulário por seção"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Relatórios Completos",
      description: "Documentos com evidências visuais completas"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile First",
      description: "Interface otimizada para dispositivos móveis"
    }
  ];

  const userTypes = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Administrador",
      emoji: "👨‍💼",
      color: "bg-blue-500",
      features: [
        "Gera links únicos",
        "Monitora formulários",
        "Visualiza relatórios",
        "Exporta documentos"
      ]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Técnico de Campo",
      emoji: "🔧",
      color: "bg-green-500",
      features: [
        "Acessa via link direto",
        "Preenche no celular",
        "Anexa fotos por seção",
        "Sem necessidade de cadastro"
      ]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Responsável Regional",
      emoji: "📊",
      color: "bg-purple-500",
      features: [
        "Recebe relatórios completos",
        "Avalia condições de segurança",
        "Analisa por período/empresa",
        "Toma decisões baseadas em dados"
      ]
    }
  ];

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Problems vs Solutions */}
          <div className="text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Motivação

              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Do problema atual para a solução completa para inspeção de EPIs/EPCs
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Problems */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Problemas Atuais
                </h3>
                <div className="space-y-4">
                  {problems.map((problem, index) => (
                    <Card key={index} className="border-red-200 bg-red-50/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="text-red-600">
                            {problem.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-800">
                              {problem.title}
                            </h4>
                            <p className="text-red-700 text-sm">
                              {problem.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Solutions */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Nossas Soluções
                </h3>
                <div className="space-y-4">
                  {solutions.map((solution, index) => (
                    <Card key={index} className="border-green-200 bg-green-50/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="text-green-600">
                            {solution.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-800">
                              {solution.title}
                            </h4>
                            <p className="text-green-700 text-sm">
                              {solution.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Types */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Quem Usa o Sistema
              </h2>
              <p className="text-xl text-muted-foreground">
                Soluções personalizadas para cada tipo de usuário
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {userTypes.map((user, index) => (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto">
                      <div className={`w-16 h-16 ${user.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                        {user.emoji}
                      </div>
                    </div>
                    <CardTitle className="text-xl">
                      {user.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {user.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
