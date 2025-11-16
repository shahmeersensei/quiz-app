// src/app/html/python-basic/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import pythonBasicQuestions from "../python-basic.json";
import UserInfoForm, { UserData } from "@/components/forms/UserInfoForm";
import BlockedScreen from "@/components/ui/BlokedScreen";

import screenfull from 'screenfull';
import FullScreenPrompt from "@/components/FullScreenPrompt";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type QuestionPart = { type: 'text' | 'code'; content: string; };
type QuizData = { question: QuestionPart[] | string; a: string; b: string; c: string; d: string; correct: string; };
type OptionKey = 'a' | 'b' | 'c' | 'd';

const PythonBasicPage: React.FC = () => {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quizData, setQuizData] = useState<QuizData[]>(pythonBasicQuestions as QuizData[]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string | null; }>({});
  const [timeRemaining, setTimeRemaining] = useState(5400);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [disqualificationMessage, setDisqualificationMessage] = useState<string | null>(null);

  const { width, height } = useWindowSize();
  const fullScreenRef = useRef<HTMLDivElement>(null);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleChange = () => {
      if (!screenfull.isEnabled) return;

      const isCurrentlyFullscreen = screenfull.isFullscreen;
      setIsFullScreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isQuizStarted && !isFinished) {
        const newCount = fullscreenExitCount + 1;
        setFullscreenExitCount(newCount);

        if (newCount >= 3) {
          setDisqualificationMessage("Quiz terminated due to exiting full-screen mode multiple times.");
          finishQuiz(score);
        } else {
          alert(`Warning: You have exited full-screen. You have ${3 - newCount} attempt(s) remaining before the quiz is automatically submitted.`);
        }
      }
    };

    if (screenfull.isEnabled) {
      screenfull.on('change', handleChange);
    }
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleChange);
      }
    };
  }, [isQuizStarted, isFinished, fullscreenExitCount, score]);

  useEffect(() => {
    if (!isQuizStarted || isFinished || !isFullScreen) return;
    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          finishQuiz(score);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isQuizStarted, isFinished, score, isFullScreen]);

  const requestFullScreen = () => {
    if (screenfull.isEnabled && fullScreenRef.current) {
      screenfull.request(fullScreenRef.current);
    }
  };

  const handleStartQuiz = (data: UserData) => {
    const { rollNumber } = data;
    const attemptKey = `quizAttempts_${rollNumber}`;
    if (typeof window !== "undefined") {
      const attempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
      if (attempts >= 3) {
        setIsBlocked(true);
        return;
      }
    }
    setUserData(data);
    setIsQuizStarted(true);
    setStartTime(new Date());
    requestFullScreen();
    setIsFullScreen(true);
  };

  const submitQuizResults = async (finalScore: number) => {
    if (!userData) return;
    try {
      await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, score: finalScore }),
      });
    } catch (error) { console.error("Error submitting quiz results:", error); }
  };

  const loadQuiz = () => { setSelectedAnswer(null); };
  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => { setSelectedAnswer(event.target.id); };

  const getTimeTaken = () => {
    if (startTime) {
      const endTime = new Date();
      const timeTaken = new Date(endTime.getTime() - startTime.getTime());
      setMinutes(timeTaken.getUTCMinutes());
      setSeconds(timeTaken.getUTCSeconds());
    }
  };

  const finishQuiz = (finalScore: number) => {
    if (isFinished) return; // Prevent this from running multiple times
    
    if (userData && typeof window !== "undefined") {
        const { rollNumber } = userData;
        const attemptKey = `quizAttempts_${rollNumber}`;
        const attempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
        localStorage.setItem(attemptKey, (attempts + 1).toString());
    }
    getTimeTaken();
    setIsFinished(true);
    submitQuizResults(finalScore);
    if (screenfull.isEnabled) {
      screenfull.exit();
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) { alert("Please select an answer."); return; }
    let currentScore = score;
    if (selectedAnswer === quizData[currentQuiz].correct) { currentScore += 1; }
    setScore(currentScore);
    setUserAnswers((prev) => ({ ...prev, [currentQuiz]: selectedAnswer }));
    setTimeout(() => {
      if (currentQuiz < quizData.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
        loadQuiz();
      } else {
        finishQuiz(currentScore);
      }
    }, 200);
  };
  
  const handleConfetti = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 30000); };
  
  const currentQuestionData = isQuizStarted ? quizData[currentQuiz] : null;

  return (
    <div ref={fullScreenRef}>
      {(() => {
        if (isBlocked) {
          return <BlockedScreen />;
        }
        if (!isQuizStarted) {
          return <UserInfoForm onStartQuiz={handleStartQuiz} />;
        }
        if (isQuizStarted && !isFinished && !isFullScreen) {
          return <FullScreenPrompt onEnterFullScreen={requestFullScreen} />;
        }
        if (!currentQuestionData) {
            return null;
        }
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-r from-[#b8c6db] to-[#f5f7fa] pt-16">
              {showConfetti && <Confetti width={width} height={height} />}
              <header className="fixed top-0 z-50 w-full bg-gray-800 py-4 text-white shadow-lg flex justify-around items-center">
                  <div className='text-left'>
                    <h1 className="text-2xl font-bold">Python Basic Quiz</h1>
                    <p className="text-sm mt-1">Test your knowledge!</p>
                  </div>
                  {!isFinished && (
                    <div className="text-xl font-bold bg-white text-gray-800 px-4 py-2 rounded-lg">
                        Time Left: {formatTime(timeRemaining)}
                    </div>
                  )}
              </header>
              <div className="w-full max-w-2xl md:max-w-3xl mx-4 overflow-auto rounded-lg bg-white shadow-2xl transform transition-all duration-300">
                  {!isFinished ? (
                    <div className="quiz-header p-6 md:p-12">
                        <div className="mb-4 text-center">
                          <p className="text-lg font-semibold">Question {currentQuiz + 1} of {quizData.length}</p>
                          <p className="text-sm text-gray-500">{quizData.length - (currentQuiz + 1)} question(s) remaining</p>
                        </div>
                        <div className="my-4 text-left text-xl md:text-2xl font-semibold space-y-4">
                          {Array.isArray(currentQuestionData.question) ? (
                              currentQuestionData.question.map((part, index) => {
                                if (part.type === 'text') {
                                    return <p key={index} className="leading-relaxed">{part.content}</p>;
                                }
                                if (part.type === 'code') {
                                    return (
                                    <div key={index} className="text-base rounded-md overflow-hidden shadow-md">
                                        <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ margin: 0, padding: "1.25rem" }}>
                                        {part.content}
                                        </SyntaxHighlighter>
                                    </div>
                                    );
                                }
                                return null;
                              })
                          ) : ( <p>{currentQuestionData.question}</p> )}
                        </div>
                        <ul className="list-none p-0 mt-6">
                          {(['a', 'b', 'c', 'd'] as OptionKey[]).map((key) => (
                              <li key={key} className="my-3 text-lg md:text-xl">
                                <div className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                    <input type="radio" id={key} name="answer" className="mr-4 h-5 w-5 cursor-pointer" checked={selectedAnswer === key} onChange={handleAnswerChange} aria-label={`Option ${key.toUpperCase()}`}/>
                                    <label htmlFor={key} className="cursor-pointer flex-1">{currentQuestionData[key]}</label>
                                </div>
                              </li>
                          ))}
                        </ul>
                        <div className="mt-8 flex justify-center">
                          <Button className="h-12 px-10 text-lg font-bold" onClick={handleSubmit} title="Submit your answer">
                              {currentQuiz === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
                          </Button>
                        </div>
                    </div>
                  ) : (
                    <div className="quiz-header p-6 md:p-16 text-center">
                        <h2 className="my-4 text-2xl font-bold">Quiz Submitted!</h2>
                        <p className="text-xl">🎉 You scored <strong>{score}</strong> out of {quizData.length}!</p>
                        <p className="text-lg mt-2">Time taken: <b>{minutes} minutes and {seconds} seconds</b>.</p>
                        
                        {disqualificationMessage ? (
                          <p className="mt-4 font-bold text-red-600 animate-pulse">{disqualificationMessage}</p>
                        ) : (
                          <p className="mt-4 text-gray-600">Your results have been recorded. Thank you for participating.</p>
                        )}

                        <div className="mt-8 flex justify-center">
                          <Button className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-lg font-bold text-white shadow" onClick={handleConfetti} title="Celebrate your success">
                              🎉 Celebrate 🎉
                          </Button>
                        </div>
                    </div>
                  )}
              </div>
              <footer className="absolute bottom-0 w-full py-3 md:py-5 text-center">
                  <p className="text-black">Built with ❤️ by{" "}<a href="https://github.com/shahmeersensei/" target="_blank" className="font-bold text-black no-underline hover:underline">Syed Shah Meer Ali</a></p>
              </footer>
            </div>
        );
      })()}
    </div>
  );
};

export default PythonBasicPage;