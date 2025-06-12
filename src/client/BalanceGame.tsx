import React, { useState, useEffect, useCallback, useRef } from 'react';


export const BalanceGame: React.FC = () => {
  
  const [balance, setBalance] = useState(50);
  const [status, setStatus] = useState("Perfectly Balanced");

  const balanceRef = useRef<number>(50);
  const hoverRef = useRef<"left" | "right" | null>(null);
  const timeRef = useRef<number>(performance.now());
  const animationRef = useRef<number>();

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
    const delta = (currentTime - timeRef.current) / 1000;
    timeRef.current = currentTime;

    let nextBalance = balanceRef.current;
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
    if (hoverRef.current === "left") nextBalance -= hoverForce;
    if (hoverRef.current === "right") nextBalance += hoverForce;

    if (nextBalance < 0 || nextBalance > 100) {
      nextBalance = 50;
      setStatus("You lost balance!");
      
      timeRef.current = currentTime;
    } else {
      updateStatus(nextBalance);
    }

    balanceRef.current = nextBalance;
    setBalance(nextBalance);

    animationRef.current = requestAnimationFrame(gameLoop);
  };
  
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  const getSpritePosition = (balance) => {
    const frame = Math.min(99, Math.max(0, Math.floor(balance)));
    const col = frame % 10;
    const row = Math.floor(frame / 10);
    const x = -col * 64;
    const y = -row * 64;
    return `${x}px ${y}px`;
  };
  
  return <>
    <div>
      
      <label>Cats can balance</label>
        
      <div
        onMouseEnter={() => (hoverRef.current = "left")}
        onMouseLeave={() => (hoverRef.current = null)}>Left</div>
    
      <div
        onMouseEnter={() => (hoverRef.current = "right")}
        onMouseLeave={() => (hoverRef.current = null)}>Right</div>

      <div>
        <div>Score: {Math.round(balance)}</div>
        <div>Status: {status}</div>
      </div>
    
    </div>
  </>
}