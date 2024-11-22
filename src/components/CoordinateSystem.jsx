import React from 'react';

const CoordinateSystem = ({ width, height, scale }) => {
    const drawGrid = (ctx) => {
        ctx.strokeStyle = '#c5c5c5';
        ctx.lineWidth = 0.5;

        const centerX = width / 2; // Центр по оси X
        const centerY = height / 2; // Центр по оси Y

        for (let x = -centerX; x < centerX; x += scale) {
            ctx.beginPath();
            ctx.moveTo(centerX + x, 0);
            ctx.lineTo(centerX + x, height);
            ctx.stroke();
        }

        for (let y = -centerY; y < centerY; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, centerY - y);
            ctx.lineTo(width, centerY - y);
            ctx.stroke();
        }
    };

    const drawAxes = (ctx) => {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        const centerX = width / 2; // Центр по оси X
        const centerY = height / 2; // Центр по оси Y

        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#000';
        ctx.fillText('X', width - 10, centerY - 10);
        ctx.fillText('Y', centerX + 10, 10);
    };

    const draw = (ctx) => {
        drawGrid(ctx);
        drawAxes(ctx);
    };

    return { draw };
};

export default CoordinateSystem;