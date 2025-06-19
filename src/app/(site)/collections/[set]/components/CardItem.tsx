import Link from 'next/link';

type CardItemProps = {
  id: string;
  name: string;
  image: string | undefined;
};

export function CardItem({ id, name, image }: CardItemProps) {
  return (
    <div
      key={id}
      className="bg-neutral-900 rounded-xl p-2 hover:scale-105 transition"
    >
      <Link href={`/card/cardId/${encodeURIComponent(id)}`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="rounded-lg w-full h-auto object-cover"
          />
        ) : (
          <div className="w-full h-[350px] bg-neutral-800 rounded-lg flex items-center justify-center">
            <p className="text-xs text-neutral-400 text-center">
              Sem imagem
            </p>
          </div>
        )}
      </Link>
    </div>
  );
}
