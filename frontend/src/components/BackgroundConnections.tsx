import React, { useEffect, useRef } from 'react';

export const BackgroundConnections: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 100; // Aumentado para mais densidade
    const connectionDistance = 180;
    const colors = ['#10b981', '#fbbf24']; // Verde Esmeralda e Ouro

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulseFactor: number;
      pulseSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulseFactor = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
        
        this.pulseFactor += this.pulseSpeed;
      }

      draw(globalPulse: number) {
        if (!ctx) return;
        
        const localPulse = (Math.sin(this.pulseFactor) + 1) / 2;
        const finalPulse = (localPulse * 0.5 + globalPulse * 0.5);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (1 + finalPulse * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Efeito de Brilho Neon
        ctx.shadowBlur = 15 * finalPulse;
        ctx.shadowColor = this.color;
        ctx.fill();
        
        // Reset shadow para não afetar as linhas
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = (globalPulse: number) => {
      if (!ctx) return;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * (0.1 + globalPulse * 0.4);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Gradiente para conexões entre cores diferentes
            const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            gradient.addColorStop(0, `${particles[i].color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${particles[j].color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 * (globalPulse * 0.5 + 0.5);
            ctx.stroke();
          }
        }
      }
    };

    let time = 0;
    const animate = () => {
      time += 0.01;
      const globalPulse = (Math.sin(time) + 1) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fundo escuro profundo para realçar o neon
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw(globalPulse);
      });

      drawConnections(globalPulse);
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ display: 'block', background: '#020617' }}
    />
  );
};
