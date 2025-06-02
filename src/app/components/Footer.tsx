export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto text-center text-neutral-400">
        <p>&copy; {new Date().getFullYear()} MTG Brasil. Todos os direitos reservados.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="https://github.com/SEU_USUARIO/magic-card-search" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">
            GitHub
          </a>
          <a href="https://x.com/SEU_USUARIO" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">
            X
          </a>
        </div>
      </div>
    </footer>
  );
}