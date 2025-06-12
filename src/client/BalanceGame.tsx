import React, { useState, useEffect, useCallback, useRef } from 'react';
import testSprite from 'assets/sprite.png'


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
      lastTime.current = currentTime;
      //return;
    } else {
      setBalance(nextBalance);
      updateStatus(nextBalance);
    }

    animationFrame.current = requestAnimationFrame(gameLoop);
  };
  
  const getSpritePosition = (balance) => {
    const frame = Math.min(99, Math.max(0, Math.floor(balance)));
    const col = frame % 10;
    const row = Math.floor(frame / 10);
    const x = -col * 64;
    const y = -row * 64;
    return `${x}px ${y}px`;
  };
  
  useEffect(() => {
    console.log("started");
    animationFrame.current = requestAnimationFrame(gameLoop);
    return () => {
      console.log("end");
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);
  
  return <>
      <div>
        <label>Cats can balance</label>
        
        <div
          onMouseEnter={() => (hovering.current = "left")}
          onMouseLeave={() => (hovering.current = null)}>Left</div>
        
        <div
          onMouseEnter={() => (hovering.current = "right")}
          onMouseLeave={() => (hovering.current = null)}>Right</div>
        
        <div>
          <div>Score: {Math.round(balance)}</div>
          <div>Status: {status}</div>
        </div>
        
        <div
          className="sprite"
          style={{
            width: "64px",
            height: "64px",
            backgroundImage: 'url(' + sprite + ')',
            backgroundPosition: getSpritePosition(balance),
            backgroundSize: "640px 640px" // 10x64 by 10x64 if sprite is 64px/frame
          }}
        />
        
      </div>
  </>
}