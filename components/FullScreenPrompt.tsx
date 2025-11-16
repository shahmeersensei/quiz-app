"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

interface FullScreenPromptProps {
  onEnterFullScreen: () => void;
}

const FullScreenPrompt: React.FC<FullScreenPromptProps> = ({ onEnterFullScreen }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-yellow-50 text-center p-4">
      <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-2xl border-2 border-yellow-500">
        <h1 className="text-3xl font-bold text-yellow-700">Quiz Paused</h1>
        <p className="text-gray-700 mt-4 text-lg">
          You have exited full-screen mode. The quiz requires full-screen to continue.
        </p>
        <p className="text-gray-600 mt-2">
          Please click the button below to resume.
        </p>
        <Button
          onClick={onEnterFullScreen}
          className="mt-6 h-12 px-10 text-lg font-bold bg-green-600 hover:bg-green-700"
        >
          Re-enter Full Screen
        </Button>
      </div>
    </div>
  );
};

export default FullScreenPrompt;