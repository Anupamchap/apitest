let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let secret = require('../config').secret;

let AccountSchema = new mongoose.Schema({
  id: {type: String, unique: true, required: [true, "can't be blank"]},
  balance: Number
}, {timestamps: true});

AccountSchema.plugin(uniqueValidator, {message: 'is already taken.'});

AccountSchema.methods.toAuthJSON = function(){
  return {
    id: this.id,
    balance: this.balance,
  };
};

mongoose.model('Account', AccountSchema);
