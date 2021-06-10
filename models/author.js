const mongoose = require('mongoose');

const moment = require('moment');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    family_name: {
        type: String,
        required: true
    },
    date_of_birth: {
        type: Date,
        requied: true
    },
    date_of_death: {
        type: Date
    }
});

AuthorSchema.virtual('name').get(function(){
    return this.family_name + ', ' + this.first_name;
});

AuthorSchema.virtual('url').get(function(){
    return '/catalog/author/' + this._id;
});

AuthorSchema
.virtual('date_of_birth_formatted')
.get(function () {
//   return moment(this.due_back).format('DD MMMM YYYY');
  return this.date_of_birth ? moment(this.date_of_birth).format('DD MMMM YYYY') : '';
});

AuthorSchema
.virtual('date_of_death_formatted')
.get(function () {
    return this.date_of_death ? moment(this.date_of_death).format('DD MMMM YYYY') : '';
//   return moment(this.due_back).format('DD MMMM YYYY');
});

module.exports = mongoose.model('Author', AuthorSchema);