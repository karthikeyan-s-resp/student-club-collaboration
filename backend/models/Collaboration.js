const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema(
  {
    fromClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    toClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    proposedEventTitle: {
      type: String,
      required: [true, 'Please provide proposed event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please describe collaboration idea/scope'],
    },
    proposedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    responseMessage: {
      type: String,
      default: '',
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collaboration', collaborationSchema);
