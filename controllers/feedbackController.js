import Feedback from '../models/feedbackModel.js';

export const submitFeedback = async (req, res) => {
  try {
    const { type, category, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message are required.' });
    }

    const feedback = new Feedback({
      type,
      category: type === 'general' ? category : null,
      message,
    });

    await feedback.save();

    res.status(200).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
