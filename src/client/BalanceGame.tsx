import React, { useState, useEffect, useCallback } from 'react';


export const BalanceGame: React.FC = () => {
  
  const [balance, setBalance] = useState(50);
  const [status, setStatus] = useState("Perfectly Balanced");

  const hovering = useRef<"left" | "right" | null>(null);
  const lastTime = useRef<number>(performance.now());
  const animationFrame = useRef<number>();

  const getDriftSpeed = (diff: number) => {
    return 0.2 + diff * 0.01;
  };
  
  const updateStatus = (val: number) => {
    if (Math.round(val) === 50) {
      setStatus("Perfectly Balanced");
    } else if (val < 50) {
      setStatus("Falling Left");
    } else {
      setStatus("Falling Right");
    }
  };

  const gameLoop = (currentTime: number) => {
    const delta = (currentTime - lastTime.current) / 1000;
    lastTime.current = currentTime;

    let nextBalance = balance;
    const diff = Math.abs(nextBalance - 50);
    const drift = getDriftSpeed(diff) * delta * 30;

    if (Math.round(nextBalance) === 50) {
      nextBalance += Math.random() < 0.5 ? -0.1 : 0.1;
    }
    
    if (nextBalance < 50) {
      nextBalance -= drift;
    } else if (nextBalance > 50) {
      nextBalance += drift;
    }

    const hoverForce = 10 * delta;
    if (hovering.current === "left") nextBalance -= hoverForce;
    if (hovering.current === "right") nextBalance += hoverForce;

    if (nextBalance < 0 || nextBalance > 100) {
      setBalance(50);
      setStatus("💀 You lost balance!");
      setStatusColor("red");
      lastTime.current = currentTime;
      return;
    } else {
      setBalance(nextBalance);
      updateStatus(nextBalance);
    }

    animationFrame.current = requestAnimationFrame(gameLoop);
  };
  
  useEffect(() => {
    animationFrame.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);
  
  return <>
      <div>
        <label>Cats can balance</label>
        
        <button
          onMouseEnter={() => (hovering.current = "left")}
          onMouseLeave={() => (hovering.current = null)}>Left</button>
        
        <button
          onMouseEnter={() => (hovering.current = "right")}
          onMouseLeave={() => (hovering.current = null)}>Right</button>
        
        <label>Score:</label>
      </div>
  </>
}