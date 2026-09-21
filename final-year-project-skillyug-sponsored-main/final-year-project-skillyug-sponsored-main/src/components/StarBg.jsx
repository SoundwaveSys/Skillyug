import React, { useEffect, useRef } from 'react';
import './StarBg.css';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  let animationFrameId = null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rgb = [200, 200, 200];

    let width = window.innerWidth;
    let height = window.innerHeight;

    const opts = {
      particleColor: "rgba(255, 255, 255, 1)",
      lineColor: "rgba(255, 255, 255, 1)",
      particleAmount: 30,
      defaultSpeed: 1,
      variantSpeed: 1,
      defaultRadius: 2,
      variantRadius: 2,
      linkRadius: 200
    };

    canvas.width = width;
    canvas.height = height;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.speed = opts.defaultSpeed + Math.random() * opts.variantSpeed;
        this.directionAngle = Math.floor(Math.random() * 360);
        this.color = opts.particleColor;
        this.radius = opts.defaultRadius + Math.random() * opts.variantRadius;
        this.vector = {
          x: Math.cos(this.directionAngle) * this.speed,
          y: Math.sin(this.directionAngle) * this.speed
        };
      }

      update() {
        this.border();
        this.x += this.vector.x;
        this.y += this.vector.y;
      }

      border() {
        if (this.x >= width || this.x <= 0) this.vector.x *= -1;
        if (this.y >= height || this.y <= 0) this.vector.y *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const checkDistance = (x1, y1, x2, y2) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const linkPoints = (point1, hubs) => {
      for (let i = 0; i < hubs.length; i++) {
        const distance = checkDistance(point1.x, point1.y, hubs[i].x, hubs[i].y);
        const opacity = 1 - distance / opts.linkRadius;
        if (opacity > 0) {
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(point1.x, point1.y);
          ctx.lineTo(hubs[i].x, hubs[i].y);
          ctx.stroke();
        }
      }
    };

    const setup = () => {
      particles.current = [];
      for (let i = 0; i < opts.particleAmount; i++) {
        particles.current.push(new Particle());
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      particles.current.forEach((p) => {
        p.update();
        p.draw();
      });
      particles.current.forEach((p) => {
        linkPoints(p, particles.current);
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    setup();
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="canvas" />
      
    </>
  );
};

export default ParticleBackground;
