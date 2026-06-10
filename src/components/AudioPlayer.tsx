import React, { useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  title: string;
  composer?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, composer }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <button className="audio-play-btn" onClick={togglePlay}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <div className="audio-info">
        <div className="audio-title">{title}</div>
        {composer && <div className="audio-composer">{composer}</div>}
      </div>
    </div>
  );
};
