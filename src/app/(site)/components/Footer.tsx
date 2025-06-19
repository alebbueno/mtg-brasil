// Footer.tsx
import Link from 'next/link'; // Importar Link se for usar para navegação interna

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto text-center text-neutral-400">
        <div className="grid md:grid-cols-3 gap-8 mb-8 text-left md:text-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-500 mb-3">Navegação</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-amber-500 transition">Página Inicial</Link></li>
              <li><Link href="/collections" className="hover:text-amber-500 transition">Coleções</Link></li>
              <li><Link href="/glossary" className="hover:text-amber-500 transition">Glossário</Link></li>
              <li><Link href="/favorites" className="hover:text-amber-500 transition">Favoritos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-500 mb-3">Recursos</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-amber-500 transition">Sobre o MTG Translate</Link></li>
              <li><a href="https://magic.wizards.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">Site Oficial do Magic</a></li>
              <li><a href="https://scryfall.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">Scryfall</a></li>
              {/* Adicione aqui: Termos de Uso, Política de Privacidade se necessário */}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-500 mb-3">Comunidade</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/SEU_USUARIO/SEU_REPOSITORIO" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">GitHub do Projeto</a></li>
              <li><a href="https://x.com/SEU_USUARIO" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">Nosso X (Twitter)</a></li>
              {/* Adicione aqui: Contato */}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8">
          <p>&copy; {currentYear} MTG Translate. Todos os direitos reservados.</p>
          <p className="text-sm mt-1">
            Magic: The Gathering é propriedade da Wizards of the Coast. Este site não é afiliado à Wizards of the Coast.
          </p>
        </div>
      </div>
    </footer>
  );
}