const mongoose = require('mongoose');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sendControllerError = (res, error) => {
  if (error?.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${error.path || 'identifier'}` });
  }

  if (error?.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with this value already exists' });
  }

  return res.status(500).json({ success: false, message: 'An unexpected server error occurred' });
};

module.exports = { isValidObjectId, sendControllerError };
