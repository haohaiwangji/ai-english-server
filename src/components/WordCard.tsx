'use client';

import { Card, CardBody } from "@nextui-org/react";
import { Word } from "@/types";
import { useState } from "react";
import { motion } from "framer-motion";

interface WordCardProps {
  word: Word;
}

export function WordCard({ word }: WordCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card 
      className={`backdrop-blur-sm bg-white/90 ${isPlaying ? 'border-primary border-2' : ''}`}
      isPressable
      onPress={() => speak(word.en)}
    >
      <CardBody className="p-3">
        <div className="text-center">
          <div className="text-lg font-bold flex items-center justify-center gap-2">
            {word.en}
            {isPlaying && (
              <motion.span 
                className="inline-block w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </div>
          <div className="text-sm text-gray-500">{word.zh}</div>
        </div>
      </CardBody>
    </Card>
  );
} 