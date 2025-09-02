// server/routes/ai.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google AI client with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST api/ai/check-resume
// @desc    Analyze a resume against a job description
// @access  Private
router.post('/check-resume', auth, async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ msg: 'Please provide both resume and job description text.' });
  }

  try {
    // ## THIS IS THE CORRECTED LINE ##
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
      You are an expert career coach and professional resume reviewer for a top tech company.
      Your task is to analyze the following resume based on the provided job description.
      Provide your feedback in three distinct sections using markdown formatting:
      1.  **## Strengths:** What the resume does well in relation to the job.
      2.  **## Areas for Improvement:** What is weak or missing.
      3.  **## Actionable Suggestions:** Specific, concrete advice on what to change or add.
      Be encouraging but provide critical, honest feedback to help the candidate succeed.
      ---
      **Job Description:**
      ${jobDescription}
      ---
      **Candidate's Resume:**
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    res.json({ feedback });

  } catch (err) {
    console.error('Error calling Gemini API:', err);
    res.status(500).send('Error generating AI feedback.');
  }
});


// ## ADD THIS NEW ROUTE FOR THE INTERVIEWER ##
// @route   POST api/ai/interview
// @desc    Handle a turn in the AI interview conversation
// @access  Private
router.post('/interview', auth, async (req, res) => {
  const { history, userAnswer, topic, company } = req.body;

  if (!userAnswer && !topic) {
    return res.status(400).json({ msg: 'User answer or topic is required.' });
  }

  try {
    // ## THE FIX IS HERE: We define a system instruction for the AI ##
    const systemInstruction = `You are 'Roop', a friendly but sharp AI technical interviewer from ${company || 'a top tech company'}. The candidate is a Computer Science fresher. Your goal is to conduct a realistic, interactive interview based on the topic of "${topic}".

    Your instructions are:
    1. If the conversation history is empty, introduce yourself and ask your first question about the topic.
    2. Analyze the candidate's answers. If correct, acknowledge it and ask a relevant follow-up about time/space complexity or optimization.
    3. If an answer is incorrect, provide a gentle hint or ask a clarifying question.
    4. Maintain a conversational and encouraging tone. Do not reveal that you are an AI model.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      systemInstruction: systemInstruction, // Pass the instructions here
    });

    const chatHistory = history || [];
    const chat = model.startChat({ history: chatHistory });

    // The message we send is now much simpler
    const message = history.length === 0 ? "Let's begin." : userAnswer;

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const roopsReply = response.text();

    res.json({ 
      reply: roopsReply,
      updatedHistory: await chat.getHistory()
    });

  } catch (err) {
    console.error('Error in AI interview route:', err);
    res.status(500).send('Error communicating with AI assistant.');
  }
});

module.exports = router;