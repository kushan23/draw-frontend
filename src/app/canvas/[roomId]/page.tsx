import { Room } from "@/app/components/Room";

export default async function CanvasPage(
    props: {
     params: Promise<{ roomId: string }>;
    }
   ) {
    const params = await props.params;
    const roomId = params.roomId;
    return <Room roomId={roomId} />
   }