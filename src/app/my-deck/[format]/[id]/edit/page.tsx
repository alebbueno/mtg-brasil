type Props = {
  params: {
    id: string;
    format: string;
  };
};

export default async function Page({ params }: Props) {
  return (
    <div>
      <h1>Editar deck {params.id} no formato {params.format}</h1>
    </div>
  );
}
