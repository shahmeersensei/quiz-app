// src/components/QuizApp.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import basicQuestions from "./basic.json";
import intermediateQuestions from "./intermediate.json";
import advancedQuestions from "./advanced.json";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define a TypeScript type for the quiz data
type QuizData = {
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correct: string;
};

const QuizApp: React.FC = () => {
  const [quizData, setQuizData] = useState<QuizData[]>(basicQuestions); // Default to basic
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showConfetti, setShowConfetti] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    [key: number]: string | null;
  }>({});
  const [questionAnswered, setQuestionAnswered] = useState(false);

  // Lock states for levels
  const [isIntermediateUnlocked, setIsIntermediateUnlocked] = useState(false);
  const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(false);

  // Use this to get the screen dimensions dynamically
  const { width, height } = useWindowSize();

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const loadQuiz = () => {
    setSelectedAnswer(null);
    setQuestionAnswered(false); // Reset questionAnswered state
  };

  const handleLevelChange = (level: string) => {
    if (level === "basic") {
      setQuizData(basicQuestions);
    } else if (level === "intermediate") {
      if (!isIntermediateUnlocked) {
        alert("You must complete the Basic quiz first!");
        return;
      }
      setQuizData(intermediateQuestions);
    } else if (level === "advanced") {
      if (!isAdvancedUnlocked) {
        alert("You must complete the Intermediate quiz first!");
        return;
      }
      setQuizData(advancedQuestions);
    }

    // Reset states for the new quiz
    setCurrentQuiz(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    loadQuiz(); // Ensure all states are reset
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (questionAnswered) {
      alert(
        "You have already selected an answer. Please continue to the next question."
      );
    } else {
      setSelectedAnswer(event.target.id);
    }
  };

  const getTimeTaken = () => {
    const endTime = new Date();
    const timeTaken = new Date(endTime.getTime() - startTime.getTime());
    setMinutes(timeTaken.getUTCMinutes());
    setSeconds(timeTaken.getUTCSeconds());
  };

  const handleSubmit = () => {
    // Ensure an answer is selected
    if (selectedAnswer !== null) {
      // Increment score if the answer is correct
      if (selectedAnswer === quizData[currentQuiz].correct) {
        setScore(score + 1);
      }

      // Save the user's answer
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuiz]: selectedAnswer,
      }));

      // Mark the question as answered
      setQuestionAnswered(true);

      // Display feedback for the current question
      setTimeout(() => {
        // Move to the next question if available
        if (currentQuiz < quizData.length - 1) {
          setCurrentQuiz(currentQuiz + 1);
          loadQuiz();
        } else {
          // Finish the quiz and calculate the time taken
          getTimeTaken();
          setIsFinished(true);

          // Unlock the next level based on the current quiz
          if (quizData === basicQuestions) {
            setIsIntermediateUnlocked(true);
          } else if (quizData === intermediateQuestions) {
            setIsAdvancedUnlocked(true);
          }
        }
      }, 1000); // Wait 1 second before moving to the next question
    } else {
      // Optionally, you can display an alert to prompt the user to select an answer
      alert("Please select an answer before submitting.");
    }
  };

  const handleConfetti = () => {
    // Start the confetti
    setShowConfetti(true);

    // Stop the confetti after 30 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 30000);
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-r from-[#b8c6db] to-[#f5f7fa] pt-16">
      {/* Show confetti only when the quiz is finished */}
      {showConfetti && <Confetti width={width} height={height} />}

      <header className="fixed top-0 z-50 w-full bg-gray-800 py-4 text-center text-white shadow-lg">
        <h1 className="text-2xl font-bold">HTML 5 Quiz</h1>
        <p className="text-sm mt-1">Test your knowledge and unlock new levels!</p>
        <div className="flex justify-center space-x-4 mt-3">
          <Button
            onClick={() => handleLevelChange("basic")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-transform transform hover:scale-105"
            title="Start the Basic Quiz"
          >
            Basic
          </Button>
          <Button
            onClick={() => handleLevelChange("intermediate")}
            disabled={!isIntermediateUnlocked}
            className={`${
              isIntermediateUnlocked
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-4 py-2 rounded-md transition-transform transform hover:scale-105`}
            title={
              isIntermediateUnlocked
                ? "Start the Intermediate Quiz"
                : "Complete the Basic Quiz to unlock"
            }
          >
            Intermediate
          </Button>
          <Button
            onClick={() => handleLevelChange("advanced")}
            disabled={!isAdvancedUnlocked}
            className={`${
              isAdvancedUnlocked
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-4 py-2 rounded-md transition-transform transform hover:scale-105`}
            title={
              isAdvancedUnlocked
                ? "Start the Advanced Quiz"
                : "Complete the Intermediate Quiz to unlock"
            }
          >
            Advanced
          </Button>
        </div>
      </header>

      <div className="w-full max-w-md md:max-w-lg mx-4 overflow-auto rounded-lg bg-white shadow-2xl transform transition-all duration-300 hover:scale-105">
        {!isFinished ? (
          <div className="quiz-header p-6 md:p-16">
            {/* Progress Indicator */}
            <div className="mb-4 text-center">
              <p className="text-lg font-semibold">
                Question {currentQuiz + 1} of {quizData.length}
              </p>
              <p className="text-sm text-gray-500">
                {quizData.length - (currentQuiz + 1)} question(s) remaining
              </p>
            </div>

            {/* Question */}
            <h2 className="my-1 p-3 text-center text-xl md:text-2xl font-semibold">
              {quizData[currentQuiz].question}
            </h2>

            {/* Options */}
            <ul className="list-none p-0">
              {["a", "b", "c", "d"].map((key) => (
                <li
                  key={key}
                  className="my-2 md:my-4 text-lg md:text-xl transition-transform transform hover:scale-105"
                >
                  <input
                    type="radio"
                    id={key}
                    name="answer"
                    className="mr-2 cursor-pointer"
                    checked={selectedAnswer === key}
                    disabled={questionAnswered}
                    onChange={handleAnswerChange}
                    aria-label={`Option ${key.toUpperCase()}`}
                  />
                  <label
                    htmlFor={key}
                    className="cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {quizData[currentQuiz][key as keyof QuizData]}
                  </label>
                </li>
              ))}
            </ul>

            {/* Feedback */}
            {selectedAnswer && questionAnswered && (
              <div className="mt-4 md:mt-8 text-center">
                {selectedAnswer === quizData[currentQuiz].correct ? (
                  <p className="text-green-500 font-semibold animate-pulse">
                    🎉 Correct! Great job!
                  </p>
                ) : (
                  <p className="text-red-500 font-semibold animate-pulse">
                    ❌ Incorrect! The correct answer is{" "}
                    <span className="text-blue-600 font-bold">
                      {
                        quizData[currentQuiz][
                          quizData[currentQuiz].correct as keyof QuizData
                        ]
                      }
                    </span>
                    .
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-4 md:mt-8 flex justify-center">
              <Button
                className="inline-flex h-8 md:h-10 items-center justify-center rounded-md bg-green-600 px-6 md:px-8 text-lg font-bold text-white shadow transition-transform transform hover:scale-105 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 disabled:pointer-events-none disabled:opacity-50"
                onClick={handleSubmit}
                title="Submit your answer"
              >
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className="quiz-header p-6 md:p-16">
            <h2 className="my-4 text-center text-xl font-bold">
              🎉 You scored {score} out of {quizData.length}!
            </h2>
            <p className="text-center text-lg">
              Time taken: <b>{minutes} minutes and {seconds} seconds</b>.
            </p>

            {quizData === basicQuestions && isIntermediateUnlocked && (
              <div className="my-4 text-center">
                <p className="text-lg font-semibold">
                  You have unlocked the Intermediate Quiz!
                </p>
                <Button
                  className="mt-4 inline-flex h-8 md:h-10 items-center justify-center rounded-md bg-blue-600 px-6 md:px-8 text-lg font-bold text-white shadow transition-transform transform hover:scale-105 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  onClick={() => handleLevelChange("intermediate")}
                  title="Proceed to Intermediate Quiz"
                >
                  Attempt Intermediate Quiz
                </Button>
              </div>
            )}

            {quizData === intermediateQuestions && isAdvancedUnlocked && (
              <div className="my-4 text-center">
                <p className="text-lg font-semibold">
                  You have unlocked the Advanced Quiz!
                </p>
                <Button
                  className="mt-4 inline-flex h-8 md:h-10 items-center justify-center rounded-md bg-blue-600 px-6 md:px-8 text-lg font-bold text-white shadow transition-transform transform hover:scale-105 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  onClick={() => handleLevelChange("advanced")}
                  title="Proceed to Advanced Quiz"
                >
                  Attempt Advanced Quiz
                </Button>
              </div>
            )}

            <div className="my-4 text-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="hover:bg-gray-200 transition-transform transform hover:scale-105"
                    title="Review your answers"
                  >
                    Review your Answers
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-h-screen max-w-lg mx-auto p-10 overflow-y-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ➡️ Review Your Answers: ❤️
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <ul>
                        {quizData.map((quiz, index) => (
                          <li key={index} className="my-2">
                            <p>
                              <b>Question {index + 1}:</b> {quiz.question}
                            </p>
                            <p>
                              <b>Your Answer:</b>{" "}
                              {quiz[userAnswers[index] as keyof QuizData] ||
                                "No Answer"}
                            </p>
                            {userAnswers[index] !== quiz.correct && (
                              <p className="text-red-500">
                                <b>Correct Answer:</b>{" "}
                                {quiz[quiz.correct as keyof QuizData]}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Thank you ❤️</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="mt-4 md:mt-8 flex justify-center">
              <Button
                className="inline-flex h-8 md:h-10 items-center justify-center rounded-md bg-black px-6 md:px-8 text-lg font-bold text-white shadow transition-transform transform hover:scale-105 hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                onClick={handleConfetti}
                title="Celebrate your success"
              >
                🎉 Congratulations 🎉
              </Button>
            </div>
          </div>
        )}
      </div>
      <footer className="absolute bottom-0 w-full py-3 md:py-5 text-center">
        <p className="text-black">
          Built with ❤️ by{" "}
          <a
            href="https://github.com/shahmeersensei/"
            target="_blank"
            className="font-bold text-black no-underline hover:underline"
          >
            Syed Shah Meer Ali
          </a>
        </p>
      </footer>
    </div>
  );
};

export default QuizApp;
