import { useMemo } from "react";

interface StarConfig {
  top: number;
  left: number;
  dx: number;
  dy: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Starfield({ count = 40 }: { count?: number }) {
  const stars = useMemo<StarConfig[]>(() => {
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    return Array.from({ length: count }, () => ({
      top: rand(0, 100),
      left: rand(0, 100),
      dx: rand(-400, 400),
      dy: rand(-300, 300),
      size: rand(1, 2),
      duration: rand(20, 60),
      delay: rand(0, 10),
    }));
  }, [count]);

  return (
    <div className="starfield">
      {stars.map((s, i) => {
        const style: (React.CSSProperties & Record<string, string>) = {
          top: `${s.top}vh`,
          left: `${s.left}vw`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          animationDuration: `${s.duration}s`,
          animationDelay: `${s.delay}s`,
        };
        style["--dx"] = `${s.dx}px`;
        style["--dy"] = `${s.dy}px`;
        style["--scale"] = `${Math.max(0.9, s.size / 3)}`;
        return <div key={i} className="star" style={style} />;
      })}
    </div>
  );
}