import { useEffect, useRef, useState, useCallback } from "react";
import { IconButton } from "./IconButton";
import {
    Circle,
    Pencil,
    RectangleHorizontalIcon,
    LogOutIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Game } from "../../../draw/Game";

export type Tool = "ellipse" | "rect" | "pencil";

export function Canvas({
    roomId,
    socket,
}: {
    roomId: string;
    socket: WebSocket;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [currentTool, setCurrentTool] = useState<Tool>("rect");
    const router = useRouter();

    // Adjust canvas size dynamically on window resize
    const resizeCanvas = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    }, []);

    useEffect(() => {
        if (game) {
            game.setTool(currentTool);
        }
    }, [currentTool, game]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const newGame = new Game(canvasRef.current, roomId, socket);
        setGame(newGame);
        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            newGame.destroy();
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [roomId, socket, resizeCanvas]);

    return (
        <div className="h-screen bg-black overflow-hidden">
            <Bar setTool={setCurrentTool} tool={currentTool} roomId={roomId} socket={socket} router={router} />
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

function Bar({
    tool,
    setTool,
    roomId,
    socket,
    router,
}: {
    tool: Tool;
    setTool: (s: Tool) => void;
    roomId: string;
    socket: WebSocket;
    router: ReturnType<typeof useRouter>;
}) {
    const leaveRoom = useCallback(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        socket.send(
            JSON.stringify({
                type: "leave_room",
                roomId,
            })
        );

        socket.close();
        router.push("/rooms");
    }, [socket, roomId, router]);

    return (
        <div className="fixed top-12 left-[630px]">
            <div className="flex justify-center pl-2">
                <IconButton activated={tool === "pencil"} icon={<Pencil />} onClick={() => setTool("pencil")} />
                <IconButton activated={tool === "rect"} icon={<RectangleHorizontalIcon />} onClick={() => setTool("rect")} />
                <IconButton activated={tool === "ellipse"} icon={<Circle />} onClick={() => setTool("ellipse")} />
                <IconButton activated={false} icon={<LogOutIcon />} onClick={leaveRoom} />
            </div>
        </div>
    );
}
