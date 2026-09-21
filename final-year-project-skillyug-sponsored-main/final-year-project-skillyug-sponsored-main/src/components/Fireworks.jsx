import React, { useEffect, useState } from 'react';
import './Fireworks.css';

const Fireworks = () => {
  const [fireworks, setFireworks] = useState([]);

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#ee5a52', '#0abde3', '#10ac84', '#f368e0', '#feca57'
  ];

  const launchPositions = [
    { left: '15%', name: 'left' },
    { left: '50%', name: 'center' },
    { left: '85%', name: 'right' }
  ];

  const createFirework = () => {
    const id = Date.now() + Math.random();
    const position = launchPositions[Math.floor(Math.random() * launchPositions.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const burstHeight = Math.random() * 40 + 20; // 20-60% from top
    const particles = Math.floor(Math.random() * 12) + 8; // 8-20 particles
    
    const newFirework = {
      id,
      position: position.left,
      color,
      burstHeight,
      particles,
      stage: 'launch' // launch -> burst -> fade
    };

    setFireworks(prev => [...prev, newFirework]);

    // Change to burst stage after launch animation
    setTimeout(() => {
      setFireworks(prev => 
        prev.map(fw => 
          fw.id === id ? { ...fw, stage: 'burst' } : fw
        )
      );
    }, 1000);

    // Remove firework after complete animation
    setTimeout(() => {
      setFireworks(prev => prev.filter(fw => fw.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to create firework
        createFirework();
      }
    }, 800 + Math.random() * 1200); // Random interval between 0.8-2s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fireworks-container">
      {fireworks.map(firework => (
        <div key={firework.id} className="firework" style={{ left: firework.position }}>
          {firework.stage === 'launch' && (
            <div 
              className="rocket"
              style={{ 
                '--rocket-color': firework.color,
                '--burst-height': `${firework.burstHeight}%`
              }}
            >
              <div className="rocket-trail"></div>
            </div>
          )}
          
          {firework.stage === 'burst' && (
            <div 
              className="burst"
              style={{ 
                bottom: `${100 - firework.burstHeight}%`,
                '--burst-color': firework.color,
                '--particle-count': firework.particles
              }}
            >
              {Array.from({ length: firework.particles }).map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    '--angle': `${(360 / firework.particles) * i}deg`,
                    '--delay': `${Math.random() * 0.2}s`,
                    '--distance': `${60 + Math.random() * 40}px`,
                    '--particle-color': firework.color
                  }}
                ></div>
              ))}
              
              {/* Inner ring of particles for fuller effect */}
              {Array.from({ length: Math.floor(firework.particles / 2) }).map((_, i) => (
                <div
                  key={`inner-${i}`}
                  className="particle inner-particle"
                  style={{
                    '--angle': `${(360 / Math.floor(firework.particles / 2)) * i + 30}deg`,
                    '--delay': `${0.1 + Math.random() * 0.2}s`,
                    '--distance': `${30 + Math.random() * 20}px`,
                    '--particle-color': firework.color
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* Ambient sparkles */}
      <div className="ambient-sparkles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              '--sparkle-color': colors[Math.floor(Math.random() * colors.length)]
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Fireworks;
