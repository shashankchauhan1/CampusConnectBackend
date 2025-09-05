const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// @route   POST api/questions
// @desc    Post a new question
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newQuestion = new Question({
            title: req.body.title,
            body: req.body.body,
            tags: req.body.tags,
            author: req.user.id
        });
        const question = await newQuestion.save();
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/questions
// @desc    Get all questions
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const questions = await Question.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name role');
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/questions/:id
// @desc    Get a single question by ID with its answers
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'name role')
            .populate({
                path: 'answers',
                populate: { path: 'author', select: 'name role' }
            });
        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/questions/:id/answers
// @desc    Post an answer to a question
// @access  Private
router.post('/:id/answers', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        const newAnswer = new Answer({
            body: req.body.body,
            author: req.user.id,
            question: req.params.id
        });

        const answer = await newAnswer.save();

        question.answers.push(answer._id);
        await question.save();

        const populatedAnswer = await Answer.findById(answer._id).populate('author', 'name role');
        res.json(populatedAnswer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/questions/:id
// @desc    Edit a question
// @access  Private (Author only)
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, body, tags } = req.body;
        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ msg: 'Question not found' });

        // Check if the user is the author
        if (question.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        question.title = title;
        question.body = body;
        question.tags = tags;
        await question.save();

        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/questions/:id
// @desc    Delete a question and its answers
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ msg: 'Question not found' });

        // Check if the user is the author
        if (question.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete all answers associated with the question first
        await Answer.deleteMany({ question: req.params.id });
        await Question.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Question and its answers removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/questions/answers/:answerId
// @desc    Edit an answer
// @access  Private (Author only)
router.put('/answers/:answerId', auth, async (req, res) => {
    try {
        const { body } = req.body;
        let answer = await Answer.findById(req.params.answerId);
        if (!answer) return res.status(404).json({ msg: 'Answer not found' });

        if (answer.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        answer.body = body;
        await answer.save();

        res.json(answer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/questions/answers/:answerId
// @desc    Delete an answer
// @access  Private (Author only)
router.delete('/answers/:answerId', auth, async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.answerId);
        if (!answer) return res.status(404).json({ msg: 'Answer not found' });

        if (answer.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Also remove the answer's reference from the parent question
        await Question.updateOne(
            { _id: answer.question },
            { $pull: { answers: req.params.answerId } }
        );
        
        await Answer.findByIdAndDelete(req.params.answerId);

        res.json({ msg: 'Answer removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;