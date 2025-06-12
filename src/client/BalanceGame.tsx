import React, { useState, useEffect, useCallback, useRef } from 'react';
import sprite from '/assets/test-sprite.png';

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
  
  return (<>
      <div className='flex flex-col justify-center items-center bg-zinc-600 text-gray-100'>
        <div className='border-2 border-red-500 min-w-3xs space-y-3'>
          <div>
            <label>Cats can balance !</label>
          </div>
          
          <div className='flex justify-center'>
            <div
              className='border-2 border-red-500'
              style={{
                width: '64px',
                height: '64px',
                backgroundImage: 'url(' + sprite + ')',
                backgroundPosition: getSpritePosition(balance),
                backgroundSize: '640px 640px'
              }}
            ></div>
          </div>

          <div className='flex flex-row'>
            <div
              className='w-full text-center bg-zinc-900'
              onMouseEnter={() => (hoverRef.current = 'left')}
              onMouseLeave={() => (hoverRef.current = null)}>Left</div>
            
            <div
              className='w-full text-center bg-zinc-900'
              onMouseEnter={() => (hoverRef.current = 'right')}
              onMouseLeave={() => (hoverRef.current = null)}>Right</div>
          </div>
          
          <div>
            <div className='text-xs'>Index: {Math.round(balance)}</div>
            <div>{status}</div>
          </div>

        </div>
      </div>
  </>)
}