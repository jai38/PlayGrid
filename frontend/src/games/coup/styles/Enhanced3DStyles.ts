// src/games/coup/styles/Enhanced3DStyles.ts

export const Enhanced3DStyles = `
  /* 3D Board Perspective */
  .game-board-3d {
    background: 
      radial-gradient(ellipse at top, rgba(30, 41, 59, 0.8) 0%, transparent 50%),
      radial-gradient(ellipse at bottom, rgba(15, 23, 42, 0.9) 0%, transparent 50%),
      linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  }

  .board-perspective {
    transform-style: preserve-3d;
  }

  .table-surface {
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  /* Player Area 3D Effects */
  .player-area {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    will-change: transform;
  }

  .player-area:hover {
    transform: 
      translate(-50%, -50%) 
      rotateZ(var(--rotation, 0deg)) 
      translateZ(35px) 
      scale(1.02) !important;
  }

  /* Influence Card 3D */
  .influence-card {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    perspective: 600px;
  }

  .influence-card svg {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .influence-card:hover svg {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
  }

  /* Responsive 3D Adjustments */
  @media (max-width: 1024px) {
    .board-perspective {
      perspective: 800px;
    }
    
    .table-surface {
      transform: rotateX(20deg) translateZ(-15px);
    }
  }

  @media (max-width: 768px) {
    .board-perspective {
      perspective: 600px;
      height: 500px !important;
    }
    
    .table-surface {
      transform: rotateX(15deg) translateZ(-10px);
    }
    
    .player-area {
      transform: 
        translate(-50%, -50%) 
        rotateZ(var(--rotation, 0deg)) 
        translateZ(15px) 
        scale(0.9) !important;
    }
  }

  @media (max-width: 640px) {
    .board-perspective {
      height: 400px !important;
      perspective: 400px;
    }
    
    .table-surface {
      transform: rotateX(10deg) translateZ(-5px);
    }
    
    .player-area {
      transform: 
        translate(-50%, -50%) 
        rotateZ(var(--rotation, 0deg)) 
        translateZ(10px) 
        scale(0.8) !important;
    }
  }

  /* Card Animations */
  .card-flip-in {
    animation: cardFlipIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes cardFlipIn {
    0% {
      transform: rotateY(-90deg) translateZ(-20px);
      opacity: 0;
    }
    50% {
      transform: rotateY(0deg) translateZ(10px);
      opacity: 0.8;
    }
    100% {
      transform: rotateY(0deg) translateZ(0px);
      opacity: 1;
    }
  }

  .card-reveal {
    animation: cardReveal 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes cardReveal {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(90deg) scale(1.1); }
    100% { transform: rotateY(0deg) scale(1); }
  }

  /* Enhanced Coin Animation */
  .coin-fly {
    animation: coinFly3D 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-style: preserve-3d;
  }

  @keyframes coinFly3D {
    0% {
      transform: translateY(0) translateZ(0) rotateY(0deg) scale(1);
      opacity: 1;
    }
    25% {
      transform: translateY(-20px) translateZ(20px) rotateY(180deg) scale(1.2);
      opacity: 1;
    }
    50% {
      transform: translateY(-40px) translateZ(30px) rotateY(360deg) scale(1.1);
      opacity: 0.8;
    }
    75% {
      transform: translateY(-30px) translateZ(20px) rotateY(540deg) scale(0.9);
      opacity: 0.4;
    }
    100% {
      transform: translateY(-60px) translateZ(0px) rotateY(720deg) scale(0.6);
      opacity: 0;
    }
  }

  /* Glow Effects for 3D */
  .glow-3d-blue {
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.4),
      inset 0 0 20px rgba(59, 130, 246, 0.1);
  }

  .glow-3d-purple {
    box-shadow: 
      0 0 25px rgba(168, 85, 247, 0.5),
      inset 0 0 25px rgba(168, 85, 247, 0.1);
  }

  .glow-3d-red {
    box-shadow: 
      0 0 20px rgba(239, 68, 68, 0.4),
      inset 0 0 20px rgba(239, 68, 68, 0.1);
  }

  /* Table Lighting */
  .table-lighting {
    background: 
      radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 100%),
      radial-gradient(ellipse 40% 30% at 30% 40%, rgba(59, 130, 246, 0.02) 0%, transparent 100%),
      radial-gradient(ellipse 40% 30% at 70% 60%, rgba(168, 85, 247, 0.02) 0%, transparent 100%);
  }

  /* Depth Layering */
  .depth-layer-1 { transform: translateZ(10px); }
  .depth-layer-2 { transform: translateZ(20px); }
  .depth-layer-3 { transform: translateZ(30px); }
  .depth-layer-4 { transform: translateZ(40px); }
  .depth-layer-5 { transform: translateZ(50px); }

  /* Interactive 3D Hover States */
  .interactive-3d {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .interactive-3d:hover {
    transform: translateZ(20px) rotateX(5deg);
  }

  .interactive-3d:active {
    transform: translateZ(10px) rotateX(2deg);
  }

  /* Mobile Touch Optimizations */
  @media (hover: none) and (pointer: coarse) {
    .player-area:hover {
      transform: 
        translate(-50%, -50%) 
        rotateZ(var(--rotation, 0deg)) 
        translateZ(25px) 
        scale(1.0) !important;
    }
    
    .interactive-3d:hover {
      transform: translateZ(15px) rotateX(3deg);
    }
  }

  /* Parallax Scrolling Effect */
  .parallax-bg {
    transform: translateZ(-100px) scale(1.2);
    opacity: 0.3;
  }

  .parallax-mid {
    transform: translateZ(-50px) scale(1.1);
    opacity: 0.6;
  }

  .parallax-front {
    transform: translateZ(0px);
    opacity: 1;
  }

  /* Action Panel 3D */
  .action-panel-3d {
    transform: translateZ(60px);
    backdrop-filter: blur(20px);
    background: rgba(15, 23, 42, 0.95);
  }

  /* Winner Celebration 3D */
  .winner-celebration-3d {
    transform-style: preserve-3d;
    animation: celebrate3D 2s ease-in-out infinite alternate;
  }

  @keyframes celebrate3D {
    0% {
      transform: rotateY(-5deg) rotateX(2deg) translateZ(0px);
    }
    100% {
      transform: rotateY(5deg) rotateX(-2deg) translateZ(20px);
    }
  }

  /* Floating Elements */
  .float-gentle {
    animation: floatGentle 3s ease-in-out infinite;
  }

  @keyframes floatGentle {
    0%, 100% { transform: translateY(0px) translateZ(0px); }
    50% { transform: translateY(-5px) translateZ(5px); }
  }

  .float-coins {
    animation: floatCoins 2s ease-in-out infinite;
  }

  @keyframes floatCoins {
    0%, 100% { 
      transform: translateY(0px) rotateZ(0deg) translateZ(0px); 
    }
    50% { 
      transform: translateY(-8px) rotateZ(180deg) translateZ(10px); 
    }
  }

  /* Enhanced Shadow System */
  .shadow-soft-3d {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  }

  .shadow-medium-3d {
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.25));
  }

  .shadow-hard-3d {
    filter: drop-shadow(0 12px 36px rgba(0, 0, 0, 0.4));
  }

  /* Atmospheric Effects */
  .atmosphere-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: particleFloat 8s linear infinite;
  }

  @keyframes particleFloat {
    0% {
      transform: translateY(100vh) translateX(0px) translateZ(0px);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) translateX(50px) translateZ(20px);
      opacity: 0;
    }
  }

  /* Responsive Typography for 3D */
  .text-3d-large {
    font-size: clamp(1.5rem, 4vw, 3rem);
    text-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .text-3d-medium {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    text-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .text-3d-small {
    font-size: clamp(0.75rem, 2vw, 1rem);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* Loading States */
  .loading-3d {
    animation: loading3DRotate 2s linear infinite;
  }

  @keyframes loading3DRotate {
    0% {
      transform: rotateY(0deg) rotateX(0deg);
    }
    25% {
      transform: rotateY(90deg) rotateX(15deg);
    }
    50% {
      transform: rotateY(180deg) rotateX(0deg);
    }
    75% {
      transform: rotateY(270deg) rotateX(-15deg);
    }
    100% {
      transform: rotateY(360deg) rotateX(0deg);
    }
  }

  /* High DPI Display Optimizations */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .influence-card svg {
      filter: 
        drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))
        drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }
  }

  /* Dark Mode Enhancements */
  @media (prefers-color-scheme: dark) {
    .game-board-3d {
      background: 
        radial-gradient(ellipse at top, rgba(15, 23, 42, 0.95) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(0, 0, 0, 0.8) 0%, transparent 50%),
        linear-gradient(180deg, #000000 0%, #0f172a 50%, #000000 100%);
    }
  }

  /* Accessibility: Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .card-flip-in,
    .card-reveal,
    .coin-fly,
    .winner-celebration-3d,
    .float-gentle,
    .float-coins,
    .loading-3d,
    .particle {
      animation: none;
    }
    
    .player-area,
    .interactive-3d {
      transition: none;
    }
    
    .player-area:hover,
    .interactive-3d:hover {
      transform: none;
    }
  }

  /* Focus Management for 3D Elements */
  .player-area:focus-within {
    outline: 2px solid #60a5fa;
    outline-offset: 4px;
    border-radius: 12px;
  }

  .influence-card:focus {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
    border-radius: 8px;
  }

  /* Performance Optimizations */
  .gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* Container Queries Support */
  @container (max-width: 600px) {
    .player-area {
      transform: 
        translate(-50%, -50%) 
        rotateZ(var(--rotation, 0deg)) 
        translateZ(8px) 
        scale(0.75) !important;
    }
  }

  /* Custom Scrollbar for 3D Panels */
  .custom-scrollbar-3d::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar-3d::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
    border-radius: 3px;
  }

  .custom-scrollbar-3d::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.5);
    border-radius: 3px;
  }

  .custom-scrollbar-3d::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }
`;