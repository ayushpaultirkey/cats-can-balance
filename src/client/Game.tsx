import React, { useState, useEffect, useCallback, useRef } from 'react';
import catBalance from '/assets/cat-balance.png';
import catIdle from '/assets/cat-idle.gif';
import boltLogo from '/assets/bolt.png'
import sendToDevvit from 'utils'


export const Game: React.FC = () => {
    const [balance, setBalance] = useState(50);
    const [score, setScore] = useState(0);
    const [isGameRunning, setIsGameRunning] = useState(false);
	  const [isGameStarted, setIsGameStarted] = useState(false);

    const balanceRef = useRef<number>(50);
    const directionRef = useRef<'left' | 'right' | null>(null);

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
        } else if (nextBalance > 50) {
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

            window.parent?.postMessage({ type: 'setScore', data: { newScore: scoreRef.current } }, '*');
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

		    setIsGameStarted(true);
        setIsGameRunning(true);
        setBalance(50);
        setScore(0);
        startScore();

        balanceRef.current = 50;
        scoreRef.current = 0;
        animationTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(gameLoop);
    };

    const startScore = () => {
        clearInterval(scoreTimerRef.current);

        scoreTimerRef.current = setInterval(() => {
            setScore(scoreRef.current++);
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const getcatBalancePosition = (balance) => {
        const frame = Math.min(99, Math.max(0, Math.floor(balance)));
        const col = frame % 10;
        const row = Math.floor(frame / 10);
        const x = -col * 128;
        const y = -row * 128;
        return `${x}px ${y}px`;
    };

    return (
        <>
            <div className='game-container'>
                <div className='game-frame'>
                  
            				<div className='logo-container'>
                        <img
                          src={boltLogo}
                          alt='Bolt.new'
                          className='logo'
                          onClick={() => {
                            window.parent?.postMessage({ type: 'boltNavigate' }, '*');
                          }}
                        />
            				</div>
                  
                    <ul className='words'>
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
                              className='start-button'
                              disabled={isGameRunning}
                              onClick={startGame}>Start</button>
                            <div className='score-container'>
                                <p>Score:</p>
                                <p className='score'>
                                    {score}
                                </p>
                            </div>
                        </li>
                    </ul>

                    <div className='sprite-container'>
                        <div
						                className={isGameStarted ? '' : 'hidden'}
                            style={{
                              width: '128px',
                              height: '128px',
                              backgroundImage: 'url(' + catBalance + ')',
                              backgroundPosition: getcatBalancePosition(balance),
                              backgroundSize: '1280px 1280px',
                              imageRendering: 'pixelated',
                            }}
                        ></div>
              					<img
              						className={isGameStarted ? 'hidden' : ''}
              						src={catIdle}
              						width={128}
              						height={128}
              					/>
                    </div>

                    <div className='game-control'>
                        <button
                          disabled={!isGameRunning}
                          onMouseEnter={() => (directionRef.current = 'left')}
                          onMouseLeave={() => (directionRef.current = null)}>&#11207;</button>
                        <button
                          disabled={!isGameRunning}
                          onMouseEnter={() => (directionRef.current = 'right')}
                          onMouseLeave={() => (directionRef.current = null)}>&#11208;</button>
                    </div>
                  
                </div>
            </div>
        </>
    );
};