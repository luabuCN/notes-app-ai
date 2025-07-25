import { ExcalidrawComponent } from "../_component/excalidraw";

export default async function Draw({ params }: { params: Promise<{ drawId: string }> }) {
  const { drawId } = await params
  return (
    <ExcalidrawComponent drawId={drawId} />
  );
}
