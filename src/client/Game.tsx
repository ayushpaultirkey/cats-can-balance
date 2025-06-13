import React, { useState, useEffect, useCallback, useRef } from 'react';
import sprite from '/assets/test-sprite.png';

export const Game: React.FC = () => {
  
  const [balance, setBalance] = useState(50);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const balanceRef = useRef<number>(50);
  const directionRef = useRef<"left" | "right" | null>(null);
  
  const animationRef = useRef<number>();
  const animationTimeRef = useRef<number>(performance.now());
  
  const scoreRef = useRef<number>(score);
  const scoreTimerRef = useRef<number>();
  

  const getDriftSpeed = (diff: number) => {
    return 0.2 + diff * 0.01;
  };
  
  const gameLoop = (currentTime: number) => {
    const delta = (currentTime - animationTimeRef.current) / 1000;
    animationTimeRef.current = currentTime;

    let nextBalance = balanceRef.current;
    const diff = Math.abs(nextBalance - 50);
    const drift = getDriftSpeed(diff) * delta * 30;

    if (Math.round(nextBalance) === 50) {
      nextBalance += Math.random() < 0.5 ? -0.1 : 0.1;
    }
    
		if (nextBalance < 50) {
			nextBalance -= drift;
		}
		else if (nextBalance > 50) {
			nextBalance += drift;
		}

    const hoverForce = 15 * delta;
		if (directionRef.current === 'left') {
			nextBalance -= hoverForce;
		}
		if (directionRef.current === 'right') {
			nextBalance += hoverForce;
		}

    if (nextBalance < 0 || nextBalance > 100) {
      nextBalance = 50;
      animationTimeRef.current = currentTime;

      setIsGameRunning(false);
      clearInterval(scoreTimerRef.current);
      cancelAnimationFrame(animationRef.current);
      
      return;
    }

    balanceRef.current = nextBalance;
    setBalance(nextBalance);

    animationRef.current = requestAnimationFrame(gameLoop);
  };
  
  const startGame = () => {
		if (isGameRunning) {
			return;
		}

		setIsGameRunning(true);
		setBalance(50);
		setScore(0);
		startScore();

		balanceRef.current = 50;
		scoreRef.current = 0;
		animationTimeRef.current = performance.now();
		animationRef.current = requestAnimationFrame(gameLoop);
  }
  
  const startScore = () => {
    clearInterval(scoreTimerRef.current);

    scoreTimerRef.current = setInterval(() => {
			setScore(scoreRef.current++);
    }, 1000);
  }
  
  useEffect(() => {
    return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
    };
  }, []);
  
  const getSpritePosition = (balance) => {
    const frame = Math.min(99, Math.max(0, Math.floor(balance)));
    const col = frame % 10;
    const row = Math.floor(frame / 10);
    const x = -col * 128;
    const y = -row * 128;
    return `${x}px ${y}px`;
  };
  
  return (<>
		<div className='h-full flex flex-col justify-center items-center bg-zinc-900 text-zinc-200 select-none'>
			<div className='border-8 border-amber-600 rounded-md min-w-96'>

				<ul className="words">
					<li>
						<p>Cats</p>
					</li>
					<li>
						<p>Can</p>
					</li>
					<li>
						<p>Balance !</p>
					</li>
					<li className='flex flex-row'>
						<button
							className='bg-amber-600 disabled:opacity-20 cursor-pointer'
							disabled={isGameRunning}
							onClick={startGame}>Start</button>
						<div className='flex flex-row relative'>
							<p>Score:</p>
							<p className='absolute sm:left-full sm:top-0 left-3 top-full p-0!'>{score}</p>
						</div>
					</li>
				</ul>

				<div className='flex justify-center'>
					<div
						style={{
							width: '128px',
							height: '128px',
							backgroundImage: 'url(' + sprite + ')',
							backgroundPosition: getSpritePosition(balance),
							backgroundSize: '1280px 1280px',
							imageRendering: 'pixelated'
						}}></div>
				</div>

				<div className='flex flex-row'>
					<button
						className='w-full text-center py-3 text-amber-600 border-t-4 border-r-4 border-amber-600 font-bold cursor-pointer disabled:opacity-0 disabled:pointer-events-none'
						disabled={!isGameRunning}
						onMouseEnter={() => (directionRef.current = 'left')}
						onMouseLeave={() => (directionRef.current = null)}>&#11207;</button>

					<button
						className='w-full text-center py-3 text-amber-600 border-t-4 border-amber-600 font-bold cursor-pointer disabled:opacity-0  disabled:pointer-events-none'
						disabled={!isGameRunning}
						onMouseEnter={() => (directionRef.current = 'right')}
						onMouseLeave={() => (directionRef.current = null)}>&#11208;</button>
				</div>

			</div>
		</div>
  </>)
}