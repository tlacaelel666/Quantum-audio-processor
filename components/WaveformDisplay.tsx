import React, { useRef, useEffect } from 'react';

interface WaveformDisplayProps {
  timeDomainData: Uint8Array | null;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ timeDomainData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!timeDomainData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    const sliceWidth = (width * 1.0) / timeDomainData.length;

    context.fillStyle = 'rgb(24, 24, 27)'; // zinc-900
    context.fillRect(0, 0, width, height);

    context.lineWidth = 2;
    context.strokeStyle = 'rgb(14, 165, 233)'; // sky-500

    context.beginPath();

    let x = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
  }, [timeDomainData]);

  return (
    <canvas ref={canvasRef} width="800" height="150" className="w-full h-auto rounded-lg"></canvas>
  );
};

export default WaveformDisplay;