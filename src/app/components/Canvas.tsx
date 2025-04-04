import { useEffect, useRef, useState } from "react";
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
type Shape = "ellipse" | "rect" | "pencil";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [currentTool, setCurrentTool] = useState<Tool>("rect");
  const router = useRouter();

  useEffect(() => {
    game?.setTool(currentTool);
  }, [currentTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const newGame = new Game(canvasRef.current, roomId, socket);
      setGame(newGame);

      return () => {
        newGame.destroy();
      };
    }
  }, [canvasRef]);

  // 🔁 Resize canvas dynamically on screen resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [game]);

  return (
    <div
      style={{
        height: "100vh",
        background: "black",
        overflow: "hidden",
      }}
    >
      <Bar
        setTool={setCurrentTool}
        tool={currentTool}
        roomId={roomId}
        socket={socket}
        router={router}
      />
      <canvas
        ref={canvasRef}
        style={{ display: "block" }}
        width={typeof window !== "undefined" ? window.innerWidth : 0}
        height={typeof window !== "undefined" ? window.innerHeight : 0}
      ></canvas>
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
  tool: Shape;
  setTool: (s: Shape) => void;
  roomId: string;
  socket: WebSocket;
  router: any;
}) {
  function leaveRoom(roomId: string, socket: WebSocket, router: any) {
    const data = JSON.stringify({
      type: "leave_room",
      roomId,
    });

    if (!socket) return;

    socket.send(data);
    router.push("/rooms");
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex space-x-4 bg-white/20 backdrop-blur-md p-2 rounded-md shadow-md">
        <IconButton
          activated={tool === "pencil"}
          icon={<Pencil />}
          onClick={() => setTool("pencil")}
        />
        <IconButton
          activated={tool === "rect"}
          icon={<RectangleHorizontalIcon />}
          onClick={() => setTool("rect")}
        />
        <IconButton
          activated={tool === "ellipse"}
          icon={<Circle />}
          onClick={() => setTool("ellipse")}
        />
        <IconButton
          activated={false}
          icon={<LogOutIcon />}
          onClick={() => leaveRoom(roomId, socket, router)}
        />
      </div>
    </div>
  );
}
