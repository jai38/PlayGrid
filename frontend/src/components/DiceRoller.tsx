import { useState, useEffect, useRef } from "react";

import DiceFace from "./DiceFace";

const captions = [
  "Oops, try again!",
  "Keep going!",
  "Nice roll!",
  "Almost there!",
  "Great move!",
  "Now you can move further! 🎉",
];

export default function DiceRoller() {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(1);
  const [caption, setCaption] = useState(captions[0]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rollDice = () => {
    if (rolling) return;
    setRolling(true);
    setCaption("Rolling...");

    // Animation: fake rapid random faces for 3 sec
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 30) {
        clearInterval(interval);
      }
    }, 100);

    // After 3 sec show final result & caption
    timeoutRef.current = setTimeout(() => {
      const finalResult = Math.floor(Math.random() * 6) + 1;
      setResult(finalResult);
      setCaption(captions[finalResult - 1]);
      setRolling(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <button
        onClick={rollDice}
        disabled={rolling}
        aria-label="Roll Dice"
        className={`transform transition-transform duration-200 ${
          rolling
            ? "cursor-wait animate-spin-slow"
            : "cursor-pointer hover:scale-110"
        }`}>
        <DiceFace number={result} />
      </button>

      <p className="text-yellow-300 font-semibold text-lg min-h-[1.5rem]">
        {caption}
      </p>
    </div>
  );
}
