import SearchBar from "@/app/(site)/components/SearchBar";

export default function HeroSection() {
  const sectionStyle = {
    backgroundImage: `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.1), rgba(255, 255, 255, 0)),
      url('/bg-header-home.png')
    `,
  };

  return (
    <section 
      className="py-16 flex items-center justify-center bg-center bg-cover bg-no-repeat h-[800px] md:py-24"
      style={sectionStyle}
    >
      <div className="container mx-auto px-6 text-center flex flex-col items-center">
        
        {/* AJUSTE: Título agora com o novo gradiente e a nova animação contínua */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 
                     bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 
                     bg-clip-text text-transparent 
                     bg-[size:200%_auto] 
                     animate-gradient-shine"
        >
          Sabe o que a carta faz? <br />Nós traduzimos para você.
        </h1>

        {/* O parágrafo e a busca mantêm a animação de entrada */}
        <p 
          className="text-neutral-300 text-lg sm:text-xl md:text-2xl mb-10 animate-fade-in-up max-w-2xl"
          style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
          Digite o nome da carta, em qualquer idioma, e veja a mágica acontecer. Não fique mais sem entender o que a carta faz!
        </p>

        <div 
          className="max-w-2xl w-full animate-fade-in-up"
          style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
        >
          <SearchBar />
        </div>
      </div>
    </section>
  );
}