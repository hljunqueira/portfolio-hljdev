import { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let columns = 0;
    let drops: number[] = [];
    const fontSize = 16;
    
    // Matriz de caracteres (Katakana + Latin + Numerais)
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ".split("");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let x = 0; x < columns; x++) {
        // Inicializa as gotas em alturas aleatórias para não caírem todas juntas no começo
        drops[x] = Math.random() * -100;
      }
    };
    
    setSize();
    window.addEventListener("resize", setSize);

    let animationFrameId: number;
    let lastDrawTime = 0;
    const fps = 30; // Matrix rain looks better when slightly staggered/choppy
    const frameInterval = 1000 / fps;

    const getPrimaryColor = () => {
      // Tenta pegar a cor primária do CSS, fallback para o Verde Matrix caso falhe
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryVar = rootStyle.getPropertyValue('--primary').trim();
      return primaryVar ? `hsl(${primaryVar})` : '#0F0';
    };

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const deltaTime = time - lastDrawTime;
      if (deltaTime < frameInterval) return;
      lastDrawTime = time - (deltaTime % frameInterval);

      // Fundo semi-transparente preto para criar o rastro (trail) das letras
      ctx.fillStyle = "rgba(4, 4, 10, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getPrimaryColor();
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < drops.length; i++) {
        // Personagem aleatório
        const text = characters[Math.floor(Math.random() * characters.length)];

        // Y atual (em pixels)
        const currentY = drops[i] * fontSize;

        // Efeito: O caractere principal da ponta é branco, os de trás são verdes
        // Podemos simplificar apenas desenhando o texto.
        
        ctx.fillText(text, i * fontSize + (fontSize/2), currentY);

        // Reseta a gota se chegou no fundo de forma aleatória
        if (currentY > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move a gota
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80"
      style={{ zIndex: 0 }}
    />
  );
}
