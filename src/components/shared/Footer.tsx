export const Footer = () => {
  return (
    <footer className="bg-secondary/10 border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Prova de Conceito - Desenvolvido por <span className="font-semibold text-foreground">Marcelo Lara</span>
            <br />
            <span className="text-muted-foreground text-sm">Não contem dados reais</span>
            <br />
            <span className="text-muted-foreground text-sm">
              <a href="https://www.linkedin.com/in/marceloldiogo/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                LinkedIn
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
