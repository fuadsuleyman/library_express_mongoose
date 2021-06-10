const Author = require('../models/author');
const Book = require('../models/book');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

var async = require('async');

exports.getIndexPage = (req, res, next) => {
  async.parallel({
    book_count: function(callback){
      Book.countDocuments({}, callback);
    },
    bookinstance_count: function(callback){
      BookInstance.countDocuments({}, callback)
    },
    bookinstance_avaible_count: function(callback){
      BookInstance.countDocuments({status: 'Available'}, callback)
    },
    genre_count: function(callback) {
      Genre.countDocuments({}, callback)     
    },
    author_count: function(callback) {
      Author.countDocuments({}, callback)
    }
  }, function(err, results) {
        res.render('index', {
          pageTitle: 'Library Home Page',
          text: 'Welcome to Local Library Home',
          error: err,
          data: results,
          path: '/catalog'
        });     
  });
};

exports.getAboutPage = (req, res, next) => {
  res.render('about', {
    pageTitle: 'About Page',
    text: 'Wolcome to About Page'
  })
}


exports.redirectToCatalog =(req, res, next) => {
  res.redirect('/catalog');
}