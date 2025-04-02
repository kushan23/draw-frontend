import { Tool } from "@/app/components/Canvas";
import { getExistingSHapes } from "./GetShapes";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "ellipse";
      centerX: number;
      centerY: number;
      radX: number;
      radY: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    };

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "ellipse";
    private pencilPath: { x: number; y: number }[] = [];

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.socket.onmessage = null;
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingSHapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach((shape) => {
            this.drawShape(shape);
        });
    }

    drawShape(shape: Shape) {
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        if (shape.type === "rect") {
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "ellipse") {
            this.ctx.beginPath();
            this.ctx.ellipse(shape.centerX, shape.centerY, shape.radX, shape.radY, 0, 0, 2 * Math.PI);
            this.ctx.stroke();
        } else if (shape.type === "pencil") {
            this.ctx.beginPath();
            shape.points.forEach((point, index) => {
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        if (this.selectedTool === "pencil") {
            this.pencilPath = [{ x: this.startX, y: this.startY }];
        }
    };

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            shape = { type: "rect", x: this.startX, y: this.startY, width, height };
        } else if (this.selectedTool === "ellipse") {
            const centerX = this.startX + (e.clientX - this.startX) / 2;
            const centerY = this.startY + (e.clientY - this.startY) / 2;
            shape = { type: "ellipse", centerX, centerY, radX: Math.abs((e.clientX - this.startX) / 2), radY: Math.abs((e.clientY - this.startY) / 2) };
        } else if (this.selectedTool === "pencil") {
            shape = { type: "pencil", points: [...this.pencilPath] };
        }

        if (shape) {
            this.existingShapes.push(shape);
            this.socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId,
                })
            );
        }
    };

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        this.clearCanvas();
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        if (this.selectedTool === "rect") {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "ellipse") {
            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
            this.ctx.stroke();
        } else if (this.selectedTool === "pencil") {
            const point = { x: e.clientX, y: e.clientY };
            this.pencilPath.push(point);
            this.ctx.beginPath();
            this.ctx.moveTo(this.pencilPath[0].x, this.pencilPath[0].y);
            this.pencilPath.forEach((p) => this.ctx.lineTo(p.x, p.y));
            this.ctx.stroke();
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
