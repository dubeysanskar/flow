"use client";

import React, { useRef, useEffect, useState } from "react";

interface AudioOscilloscopeProps {
  isActive: boolean;
  color?: string;
  height?: number;
}

/**
 * Real Web Audio API-driven oscilloscope canvas.
 * Falls back to animated synthetic wave if microphone permission is denied.
 */
export function AudioOscilloscope({ isActive, color = "#8b5cf6", height = 80 }: AudioOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);
  const synthPhaseRef = useRef(0);

  // --- Start mic + audio context ---
  useEffect(() => {
    if (!isActive) {
      stopAudio();
      return;
    }

    startAudio();
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      contextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicAllowed(true);
      drawRealWave();
    } catch {
      // Permission denied — fall back to synthetic animation
      setMicAllowed(false);
      drawSyntheticWave();
    }
  };

  const stopAudio = () => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (contextRef.current) {
      contextRef.current.close().catch(() => {});
      contextRef.current = null;
    }
    analyserRef.current = null;

    // Draw flat idle wave
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawIdleLine(ctx, canvas.width, canvas.height);
      }
    }
  };

  // --- Real microphone waveform ---
  const drawRealWave = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Glow trail ---
      ctx.shadowBlur = 16;
      ctx.shadowColor = color;

      // --- Gradient stroke ---
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, `${color}00`);
      gradient.addColorStop(0.2, color);
      gradient.addColorStop(0.8, color);
      gradient.addColorStop(1, `${color}00`);

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();
  };

  // --- Synthetic animated wave (mic denied) ---
  const drawSyntheticWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      if (!isActive) return;
      animFrameRef.current = requestAnimationFrame(draw);
      synthPhaseRef.current += 0.04;
      const phase = synthPhaseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, `${color}00`);
      gradient.addColorStop(0.2, `${color}cc`);
      gradient.addColorStop(0.8, `${color}cc`);
      gradient.addColorStop(1, `${color}00`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;

      const points = 120;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * canvas.width;
        const normalizedI = i / points;

        const y =
          canvas.height / 2 +
          Math.sin(normalizedI * Math.PI * 6 + phase) * 22 * Math.sin(normalizedI * Math.PI) +
          Math.sin(normalizedI * Math.PI * 11 + phase * 1.3) * 8 * Math.sin(normalizedI * Math.PI);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();
  };

  // --- Idle flat line ---
  const drawIdleLine = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "rgba(139,92,246,0)");
    grad.addColorStop(0.5, "rgba(139,92,246,0.2)");
    grad.addColorStop(1, "rgba(139,92,246,0)");

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full block"
        style={{ height: `${height}px` }}
      />
      {isActive && micAllowed === false && (
        <div className="absolute top-1 right-2 text-[10px] font-mono text-amber-400 opacity-70">
          simulated wave (mic unavailable)
        </div>
      )}
    </div>
  );
}
