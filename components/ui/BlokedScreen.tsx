"use client";

import React from 'react';

const BlockedScreen = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-red-50 text-center p-4">
      <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-2xl border-2 border-red-500">
        <h1 className="text-3xl font-bold text-red-700">Access Denied</h1>
        <p className="text-gray-700 mt-4 text-lg">
          You have already used all 3 of your available attempts for this quiz.
        </p>
        <p className="text-gray-600 mt-2">
          Please contact your instructor if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
};

export default BlockedScreen;