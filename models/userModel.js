const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    require: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: { values: ['user', 'guide', 'lead-guide', 'admin'] },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    // trzeba ukryć hasło, aby nie było widoczne przy jakimkolwiek wyszukiwaniu
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on SAVE and CREATE-not UPDATE!!!
      validator: function (el) {
        return el === this.password; //el = passwordConfirm
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date,
});

// document middleware for encryption
userSchema.pre('save', async function (next) {
  //this refers to current user
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12); //has return promise

  this.passwordConfirm = undefined;
  // need for validation but not in databse
  // after validation we delete this field
  next();
});

userSchema.methods.correctPassword = async function (
  //candidatePassword is not hashed
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

    return JWTTimestamp < changedTimestamp;
  }

  //False means NOT CHanged
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
