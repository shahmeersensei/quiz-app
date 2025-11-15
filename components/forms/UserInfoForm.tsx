"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define a type for the user data that the form will collect
export interface UserData {
  name: string;
  rollNumber: string;
  batch: string;
}

// Define the props for our component. It will include a function to call when the quiz starts.
interface UserInfoFormProps {
  onStartQuiz: (userData: UserData) => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onStartQuiz }) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [batch, setBatch] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Simple validation to ensure all fields are filled
    if (!name.trim() || !rollNumber.trim() || !batch) {
      setError('All fields are required. Please fill them out to continue.');
      return;
    }

    setError(''); // Clear any previous errors

    // If validation passes, call the function passed from the parent component
    onStartQuiz({ name, rollNumber, batch });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-r from-[#b8c6db] to-[#f5f7fa]">
      <div className="w-full max-w-md mx-4 p-8 space-y-6 rounded-lg bg-white shadow-2xl transform transition-all hover:scale-105">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Python Basic Quiz</h1>
          <p className="text-gray-600 mt-2">Please enter your details to start the quiz.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="font-semibold">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Syed Shah Meer Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="rollNumber" className="font-semibold">Roll Number</Label>
            <Input
              id="rollNumber"
              type="text"
              placeholder="e.g., 2024-AI-001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="batch" className="font-semibold">Batch</Label>
            <Select onValueChange={setBatch} value={batch}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select your batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agentic AI">Agentic AI</SelectItem>
                <SelectItem value="Web Dev">Web Dev</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
          <Button
            type="submit"
            className="w-full h-10 font-bold text-white bg-green-600 transition-transform transform hover:scale-105 hover:bg-green-700"
          >
            Start Quiz
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;