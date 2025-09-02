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

module.exports = router;