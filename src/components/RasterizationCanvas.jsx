import React, { useRef, useEffect, useState } from 'react';
import CoordinateSystem from './CoordinateSystem';

const colorStep = '#0000ff'; 
const colorBresenham = '#ff0000';
const colorDDA = "#00ff00";
const colorBresenhamCircle = "#7132a8";

const RasterizationCanvas = ({ width, height }) => {
    const canvasRef = useRef(null);
    const [report, setReport] = useState('');
    const [scale, setScale] = useState(5);

    const drawPixel = (ctx, x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, (y - 1) * scale, scale, scale);
    };

    const rasterizeLineByEquation = (ctx, x0, y0, x1, y1) => {
        const startTime = performance.now(); 
        const dx = x1 - x0;
        const dy = y1 - y0;
        const k = dy / dx; // Наклон
        const b = y0 - k * x0; // Свободный член
        // console.log("Вычисления для пошагового алгоритма:");
        // console.log(`Прямая y=${k.toFixed(3)}x+${b.toFixed(3)}`);
        let pixels = 0, prevY = y0;
        for (let x = x0; x <= x1; x++) {
            const y = Math.round(k * x + b); // Вычисляем y и округляем
            // console.log(`x=${x}, y=round(${k.toFixed(3)} * x + ${b.toFixed(3)})=${y}`);
            let delta = prevY < y ? 1 : -1;
            for (let newY = prevY; newY != y; newY += delta) {
                drawPixel(ctx, x - 1, newY, colorStep); // Рисуем пиксель
            }
            prevY = y;
            pixels++;
        }
        const endTime = performance.now();
        setReport(report => report + `Пошаговый алгоритм. Время выполнения: ${(endTime - startTime).toFixed(2)} мс. Количество пикселей: ${pixels}\n`);
    };

    const rasterizeLineBresenham = (ctx, x0, y0, x1, y1) => {
        const startTime = performance.now(); 
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let pixels = 0;
        while (x0 != x1 || y0 != y1) {
            drawPixel(ctx, x0, y0, colorBresenham);
            pixels++;
            const err2 = err * 2;
            if (err2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (err2 < dx) {
                err += dx;
                y0 += sy;
            }
        };
        const endTime = performance.now();
        setReport(report => report + `Алгоритм Брезенхема. Время выполнения: ${(endTime - startTime).toFixed(2)} мс. Количество пикселей: ${pixels}\n`);
    };

    const rasterizeLineDDA = (ctx, x0, y0, x1, y1) => {
        const startTime = performance.now(); 
        const dx = x1 - x0;
        const dy = y1 - y0;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const xIncrement = dx / steps;
        const yIncrement = dy / steps;

        let pixels = 0;
        for (let i = 0; i < steps; i++) {
            drawPixel(ctx, Math.round(x0), Math.round(y0), colorDDA);
            pixels++;
            x0 += xIncrement;
            y0 += yIncrement;
        };
        const endTime = performance.now();
        setReport(report => report + `Алгоритм ЦДА. Время выполнения: ${(endTime - startTime).toFixed(2)} мс. Количество пикселей: ${pixels}\n`);
    };

    const rasterizeCircleBresenham = (ctx, cx, cy, radius) => {
        const startTime = performance.now(); 
        let x = radius;
        let y = 0;
        let err = 1 - radius;

        let pixels = 0;
        while (x >= y) {
            drawPixel(ctx, cx + x, cy - y, colorBresenhamCircle);
            drawPixel(ctx, cx + y, cy - x, colorBresenhamCircle);
            drawPixel(ctx, cx - y, cy - x, colorBresenhamCircle);
            drawPixel(ctx, cx - x, cy - y, colorBresenhamCircle);
            drawPixel(ctx, cx - x, cy + y, colorBresenhamCircle);
            drawPixel(ctx, cx - y, cy + x, colorBresenhamCircle);
            drawPixel(ctx, cx + y, cy + x, colorBresenhamCircle);
            drawPixel(ctx, cx + x, cy + y, colorBresenhamCircle);
            pixels += 8;
            y++;
            if (err <= 0) {
                err += 2 * y + 1;
            } else {
                x--;
                err += 2 * (y - x + 1);
            }
        };
        const endTime = performance.now();
        setReport(report => report + `Алгоритм Брезенхема для окружности. Время выполнения: ${(endTime - startTime).toFixed(2)} мс. Количество пикселей: ${pixels}\n`);
    };

    const startDraw = () => {
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height; 
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const coordinateSystem = CoordinateSystem({ width, height, scale});
        coordinateSystem.draw(ctx);

        const centerX = width / (2 * scale); // Центр по оси X
        const centerY = height / (2 * scale); // Центр по оси Y
        const circleRadius = height / (2 * scale) - 5; // Радиус окружности

        setReport("");  
        rasterizeLineByEquation(ctx, centerX, centerY, centerX + 2, centerY - 7)
        rasterizeLineBresenham(ctx, centerX, centerY, centerX + 2, centerY - 7);
        rasterizeLineDDA(ctx, centerX, centerY, centerX + 2, centerY - 7)
        rasterizeCircleBresenham(ctx, centerX, centerY, circleRadius);
    }

    useEffect(() => {
       startDraw();
    }, [width, height, scale]);

    const onChange = (e) => {
        const newScale = Number(e.target.value);
        setScale(newScale);
    } 
    return (
        <div>
            <div style={{fontSize: "18px", display: "flex", gap: "0.5rem"}}>
                <label>Масштаб</label>
                <select value={scale} onChange={onChange}>
                    <option value={1}>1px</option>
                    <option value={5}>5px</option>
                    <option value={10}>10px</option>
                </select>
            </div>
            <div style={{display: "flex", gap: "1.5rem", fontSize: "18px"}}>
                <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <p>Пошаговый алгоритм</p>
                    <div style={{width: "10px", height: "10px", backgroundColor: colorStep}}/>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <p>Алгоритм Брезенхема</p>
                    <div style={{width: "10px", height: "10px", backgroundColor: colorBresenham}}/>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <p>Алгоритм ЦДА</p>
                    <div style={{width: "10px", height: "10px", backgroundColor: colorDDA}}/>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <p>Алгоритм Брезенхема для окружностей</p>
                    <div style={{width: "10px", height: "10px", backgroundColor: colorBresenhamCircle}}/>
                </div>
            </div>
            <pre style={{fontSize: "18px"}}>{report}</pre>
            <canvas ref={canvasRef} />
          
        </div>
    );
};

export default RasterizationCanvas;