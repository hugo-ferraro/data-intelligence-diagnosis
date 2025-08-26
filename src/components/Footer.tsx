export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
          <div>
            © 2024 Falqon. Todos os direitos reservados.
          </div>
          <div>
            <a 
              href="https://www.falqon.com.br/politica-de-privacidade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
