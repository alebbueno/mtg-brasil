import SearchBar from "@/app/components/SearchBar";
// import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-6">
            <h1 className="text-5xl font-extrabold text-amber-400 mb-4">
                MTG Translate
            </h1>
            <p className="text-neutral-400 mb-8">
                Busque cartas e traduza textos de Magic: The Gathering.
            </p>
            <SearchBar />
        </main>
    </div>
  );
}
