import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['general', 'bug'],
    required: true,
  },
  category: {
    type: String,
    enum: ['address', 'delivery', 'affiliate', 'payment', 'product', 'other', null],
    default: null,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Feedback', feedbackSchema);
