interface BoardPageProps {
    params: Promise<{
        slug: string
    }>
}


const BoardPage = async ({ params }: BoardPageProps) => {
  const { slug } = await params
  return (
      <div>
          <h1>Board: {slug}</h1>
          <p>Ova ruta radi! 🎉</p>
      </div>
  );
};

export default BoardPage;
