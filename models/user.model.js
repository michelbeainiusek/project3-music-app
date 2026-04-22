const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Instance method: compare a plain-text password against the stored hash
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

/*
  WHAT THIS FILE DOES AND WHY:
  - Defines the User document used for authentication and authorization.
  - passwordHash stores the bcrypt hash — the plain-text password is never saved.
  - role enum restricts values to 'admin' or 'user'; 'admin' gets full CRUD,
    'user' gets read-only access to all entities.
  - comparePassword is a convenience method called in the login controller.
*/
