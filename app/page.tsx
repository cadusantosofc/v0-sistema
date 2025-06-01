import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">JobMarket</h1>
          </div>
          <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
            <Link href="/login" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                Entrar
              </Button>
            </Link>
            <Link href="/register" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          Conecte Talentos com
          <span className="text-primary block sm:inline"> Oportunidades</span>
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Plataforma segura para empresas publicarem vagas e profissionais encontrarem trabalho, com pagamento integrado
          e proteção total.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
          <Link href="/register?type=worker" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Sou Profissional
            </Button>
          </Link>
          <Link href="/register?type=company" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sou Empresa
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Como Funciona</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="h-full">
            <CardHeader className="text-center sm:text-left">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4 mx-auto sm:mx-0" />
              <CardTitle className="text-lg sm:text-xl">Para Profissionais</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Cadastre-se, candidate-se às vagas e receba pagamentos automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Perfil profissional completo</li>
                <li>• Candidatura a vagas</li>
                <li>• Chat direto com empresas</li>
                <li>• Carteira digital integrada</li>
                <li>• Saque via PIX</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="text-center sm:text-left">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4 mx-auto sm:mx-0" />
              <CardTitle className="text-lg sm:text-xl">Para Empresas</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Publique vagas, encontre talentos e gerencie pagamentos com segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Publicação de vagas</li>
                <li>• Busca de profissionais</li>
                <li>• Gestão de candidaturas</li>
                <li>• Pagamentos seguros</li>
                <li>• Feedback e avaliações</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="text-center sm:text-left">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4 mx-auto sm:mx-0" />
              <CardTitle className="text-lg sm:text-xl">Garantias</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Segurança e proteção para todos os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Verificação de usuários</li>
                <li>• Proteção de pagamentos</li>
                <li>• Suporte 24/7</li>
                <li>• Resolução de disputas</li>
                <li>• Reembolso garantido</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">50k+</div>
            <div className="text-sm sm:text-base text-muted-foreground">Profissionais</div>
          </div>
          <div className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">1k+</div>
            <div className="text-sm sm:text-base text-muted-foreground">Empresas</div>
          </div>
          <div className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">2500+</div>
            <div className="text-sm sm:text-base text-muted-foreground">Vagas Publicadas</div>
          </div>
          <div className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-primary">R$ 1M+</div>
            <div className="text-sm sm:text-base text-muted-foreground">Pagamentos Processados</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-lg sm:text-xl font-bold">JobMarket</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Conectando talentos com oportunidades de forma segura e eficiente.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Para Profissionais</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/jobs" className="hover:text-foreground transition-colors">
                    Buscar Vagas
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-foreground transition-colors">
                    Meu Perfil
                  </Link>
                </li>
                <li>
                  <Link href="/wallet" className="hover:text-foreground transition-colors">
                    Carteira
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Para Empresas</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/post-job" className="hover:text-foreground transition-colors">
                    Publicar Vaga
                  </Link>
                </li>
                <li>
                  <Link href="/candidates" className="hover:text-foreground transition-colors">
                    Candidatos
                  </Link>
                </li>
                <li>
                  <Link href="/billing" className="hover:text-foreground transition-colors">
                    Faturamento
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 JobMarket. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
