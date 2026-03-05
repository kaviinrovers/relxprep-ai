import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateStudyPlan(subject, examDate, units) {
    const prompt = `You are a study planning expert. Create a detailed daily study plan for a student.

Subject: ${subject}
Exam Date: ${examDate}
Units/Topics: ${JSON.stringify(units)}

Generate a structured JSON response with this format:
{
  "plan": [
    { "day": 1, "date": "YYYY-MM-DD", "topics": ["topic1"], "hours": 2, "tasks": ["Read chapter 1", "Practice problems"] }
  ],
  "tips": ["tip1", "tip2"]
}

Consider spacing difficult topics across multiple days. Include revision days before the exam.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

export async function analyzeQuestions(extractedText, subject) {
    const prompt = `Analyze these exam questions from a ${subject} paper and identify important topics and frequently repeated questions.

Extracted Text:
${extractedText}

Return a JSON response with:
{
  "topics": [
    { "topic": "Normalization", "frequency": 5, "importance": "very_important" },
    { "topic": "SQL Joins", "frequency": 3, "importance": "important" }
  ],
  "repeated_questions": [
    { "question": "Explain normalization with examples", "times_appeared": 3 }
  ],
  "summary": "Brief analysis summary"
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

export async function generateImportantQuestions(subject, topics) {
    const prompt = `Generate the most important exam questions for ${subject} based on these topics: ${JSON.stringify(topics)}.

Return a JSON response:
{
  "questions": [
    { "question": "Explain normalization in DBMS", "importance": "very_important", "probability": 85, "marks": "16", "category": "Unit 1" },
    { "question": "What is deadlock?", "importance": "important", "probability": 72, "marks": "5", "category": "Unit 3" }
  ]
}

Include at least 15 questions. Vary the marks (2, 5, 13, 16).`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

export async function evaluateAnswer(question, answer, maxMarks) {
    const prompt = `Evaluate this exam answer.

Question: ${question}
Student's Answer: ${answer}
Maximum Marks: ${maxMarks}

Return JSON:
{
  "score": 7,
  "maxMarks": ${maxMarks},
  "feedback": "Good explanation but missing key points about...",
  "strengths": ["Clear introduction", "Good examples"],
  "improvements": ["Add more technical terms", "Include diagram description"],
  "keywords_used": ["normalization", "1NF"],
  "keywords_missed": ["BCNF", "functional dependency"]
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

export async function detectWeakTopics(studyData, testResults) {
    const prompt = `Analyze this student's study data and test results to identify weak topics.

Study Sessions: ${JSON.stringify(studyData)}
Test Results: ${JSON.stringify(testResults)}

Return JSON:
{
  "weak_topics": [
    { "topic": "Transactions", "reason": "Low test scores and minimal study time", "suggestion": "Focus 2 hours daily on this topic" }
  ],
  "strong_topics": ["Normalization", "SQL"],
  "overall_recommendation": "Focus more on Unit 3 and Unit 5"
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

export async function generateFlashcards(subject, topics) {
    const prompt = `Generate study flashcards for ${subject} covering: ${JSON.stringify(topics)}.

Return JSON:
{
  "flashcards": [
    { "front": "What is Normalization?", "back": "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. It involves dividing a database into two or more tables and defining relationships between them.", "topic": "Unit 1" }
  ]
}

Generate at least 10 flashcards with concise but complete answers.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

export async function calculateReadinessScore(studyHours, mockScores, syllabusCompletion) {
    const prompt = `Calculate an exam readiness score based on:

Study Hours (last 7 days): ${studyHours}
Mock Test Scores: ${JSON.stringify(mockScores)}
Syllabus Completion: ${syllabusCompletion}%

Return JSON:
{
  "readiness_score": 72,
  "status": "Good",
  "breakdown": {
    "study_effort": 75,
    "test_performance": 68,
    "syllabus_coverage": 72
  },
  "weak_areas": ["Unit 3", "Unit 5"],
  "recommendations": ["Increase study time for Unit 3", "Take more mock tests"],
  "estimated_grade": "B+"
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}
