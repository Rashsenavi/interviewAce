"use client";

import React from "react";
import { HelpCircle, ChevronRight, BookOpen } from "lucide-react";

const categories = [
  { name: "Technical", count: 150, color: "bg-blue-100 text-blue-700" },
  { name: "Behavioral", count: 80, color: "bg-green-100 text-green-700" },
  { name: "Case Study", count: 45, color: "bg-purple-100 text-purple-700" },
  { name: "HR", count: 60, color: "bg-orange-100 text-orange-700" },
];

const questions = [
  {
    id: 1,
    question: "Explain the difference between REST and GraphQL APIs",
    category: "Technical",
    difficulty: "Medium",
    answered: true,
  },
  {
    id: 2,
    question: "Tell me about a time you handled a difficult team member",
    category: "Behavioral",
    difficulty: "Medium",
    answered: true,
  },
  {
    id: 3,
    question: "What is your approach to system design?",
    category: "Technical",
    difficulty: "Hard",
    answered: false,
  },
  {
    id: 4,
    question: "Where do you see yourself in 5 years?",
    category: "HR",
    difficulty: "Easy",
    answered: true,
  },
  {
    id: 5,
    question: "How would you optimize a slow database query?",
    category: "Technical",
    difficulty: "Hard",
    answered: false,
  },
];

export default function QuestionsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Question Bank</h1>

      {/* Categories */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cat.color} mb-2`}
            >
              {cat.name}
            </div>
            <p className="text-2xl font-bold text-gray-900">{cat.count}</p>
            <p className="text-sm text-gray-500">questions</p>
          </div>
        ))}
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Questions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{q.category}</span>
                    <span className="text-gray-300">•</span>
                    <span
                      className={`text-xs font-medium ${
                        q.difficulty === "Easy"
                          ? "text-green-600"
                          : q.difficulty === "Medium"
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {q.answered && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Answered
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
