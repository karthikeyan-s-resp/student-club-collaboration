const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide club name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide club description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['Technical', 'Cultural', 'Sports', 'Arts & Media', 'Social & Community', 'Academic'],
      default: 'Technical',
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    },
    establishedYear: {
      type: Number,
      default: 2022,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
