import React, { useEffect, useState } from 'react';
import './QuizFireworks.css';

const QuizFireworks = () => {
  const [fireworks, setFireworks] = useState([]);

  const colors = [
    '#00d4aa', '#00cec9', '#feca57', '#ff6b6b', '#54a0ff', 
    '#5f27cd', '#ff9f43', '#10ac84', '#f368e0', '#45b7d1'
  ];

  const createCelebrationBurst = () => {
    // Create 3 fireworks for lighter performance
    const positions = ['25%', '50%', '75%'];
    
    positions.forEach((position, index) => {
      setTimeout(() => {
        const id = Date.now() + Math.random() + index;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const burstHeight = 25 + Math.random() * 40; // 25-65% from top
        const particles = 12 + Math.random() * 6; // 12-18 particles - reduced
        
        const newFirework = {
          id,
          position,
          color,
          burstHeight,
          particles,
          stage: 'launch'
        };

        setFireworks(prev => [...prev, newFirework]);

        // Burst stage
        setTimeout(() => {
          setFireworks(prev => 
            prev.map(fw => 
              fw.id === id ? { ...fw, stage: 'burst' } : fw
            )
          );
        }, 600);

        // Remove firework
        setTimeout(() => {
          setFireworks(prev => prev.filter(fw => fw.id !== id));
        }, 3000);
      }, index * 150);
    });
  };

  useEffect(() => {
    // Start celebration immediately
    createCelebrationBurst();
    
    // Optional second wave for lighter performance
    const secondBurst = setTimeout(() => {
      createCelebrationBurst();
    }, 1800);

    return () => {
      clearTimeout(secondBurst);
    };
  }, []);

  return (
    <div className="quiz-fireworks-container">
      {fireworks.map(firework => (
        <div key={firework.id} className="quiz-firework" style={{ left: firework.position }}>
          {firework.stage === 'launch' && (
            <div 
              className="quiz-rocket"
              style={{ 
                '--rocket-color': firework.color,
                '--burst-height': `${firework.burstHeight}%`
              }}
            >
              <div className="quiz-rocket-trail"></div>
            </div>
          )}
          
          {firework.stage === 'burst' && (
            <div 
              className="quiz-burst"
              style={{ 
                bottom: `${100 - firework.burstHeight}%`,
                '--burst-color': firework.color
              }}
            >
              {Array.from({ length: firework.particles }).map((_, i) => (
                <div
                  key={i}
                  className="quiz-particle"
                  style={{
                    '--angle': `${(360 / firework.particles) * i}deg`,
                    '--delay': `${Math.random() * 0.1}s`,
                    '--distance': `${50 + Math.random() * 30}px`,
                    '--particle-color': firework.color
                  }}
                ></div>
              ))}
              
              {/* Golden sparkles for extra celebration */}
              {Array.from({ length: Math.floor(firework.particles / 3) }).map((_, i) => (
                <div
                  key={`gold-${i}`}
                  className="quiz-particle gold-sparkle"
                  style={{
                    '--angle': `${(360 / Math.floor(firework.particles / 3)) * i + 45}deg`,
                    '--delay': `${0.05 + Math.random() * 0.1}s`,
                    '--distance': `${40 + Math.random() * 20}px`,
                    '--particle-color': '#ffd700'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* Reduced sparkles for better performance */}
      <div className="success-sparkles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="success-sparkle"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`,
              '--sparkle-color': colors[Math.floor(Math.random() * colors.length)]
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default QuizFireworks;