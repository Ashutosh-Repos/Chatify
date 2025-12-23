"use client";

// Audio setup - only runs on client
const getKeyStrokeSounds = () => {
  if (typeof window === "undefined") return [];
  return [
    new Audio("/sounds/keystroke1.mp3"),
    new Audio("/sounds/keystroke2.mp3"),
    new Audio("/sounds/keystroke3.mp3"),
    new Audio("/sounds/keystroke4.mp3"),
  ];
};

let keyStrokeSounds: HTMLAudioElement[] = [];

export function useKeyboardSound() {
  const playRandomKeyStrokeSound = () => {
    if (typeof window === "undefined") return;
    
    // Lazy initialize sounds
    if (keyStrokeSounds.length === 0) {
      keyStrokeSounds = getKeyStrokeSounds();
    }

    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
    if (randomSound) {
      randomSound.currentTime = 0;
      randomSound.play().catch((error) => console.log("Audio play failed:", error));
    }
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
