interface BoardPageProps {
    params: Promise<{
        slug: string
    }>
}


const BoardPage = async ({ params }: BoardPageProps) => {
// 1. Fetch board + lists + cards
// 2. Display workspace layout
// 3. Prepare za drag & drop
  const { slug } = await params
  return (
      <div>
          <h1>Board: {slug}</h1>
          <p>Ova ruta radi! 🎉</p>
      </div>
  );
};

export default BoardPage;
