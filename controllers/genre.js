const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const mongoose = require('mongoose');
const validator = require('express-validator');

const { body,validationResult } = require("express-validator");

exports.getAllGenres = (req, res, next) => {
    Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, genre_list){
        if (err){ return next(err); }
        res.render('genre/genre-list', {
            pageTitle: 'Genres Page',
            text: 'Welcome to Genres Page',
            genres: genre_list,
            path: '/catalog/genres'
        })
    })
}

// Display detail page for a specific Genre.
exports.getGenre = function(req, res, next) {
    const id = mongoose.Types.ObjectId(req.params.genreId);
    console.log(`getGenre-de id: ${id}`)
    async.parallel({
        genre: function(callback) {
            Genre.findById(id)
              .exec(callback);
        },

        genre_books: function(callback) {
          Book.find({ 'genre': id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre/genre-detail', {
          pageTitle: 'Genre Detail',
          text: 'Welcome to single Genre Page',
          genre: results.genre,
          genre_books: results.genre_books,
          path: '/catalog/bookinstances'
         } );
    });

};

// create get
exports.getGenreCreate = (req, res, next) => {
    res.render('genre/genre-edit-create', {
        pageTitle: 'Create Genre',
        text: 'Time to create new genre!',
        editing: false,
        errors: '',
        path: '/catalog/bookinstance/create'
    })
}

// Handle Genre create on POST.
exports.postGenreCreate =  [

    // Validate and santize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
          console.log(`errors: ${errors.array()[0].msg}`)
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre/genre-edit-create',{
            pageTitle: 'Create Genre',
            genre: genre,
            errors: errors.array(),
            editing: false,
            text: 'Time to create new genre!',
            path: '/catalog/bookinstance/create'
        });
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }
  
             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
  
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
  
             }
  
           });
      }
    }
  ];

// update
exports.getGenreUpdate = (req, res, next) => {
  Genre.findById(req.params.genreId)
    .exec(function(err, genre){
      if (err) { return next(err); }
      // seccessfull
      res.render('genre/genre-edit-create', {
        pageTitle: 'Update Genre',
        genre: genre,
        editing: true,
        errors: '',
        path: '/catalog/genres'
    })
    })
}

exports.postGenreUpdate = [
  // Validate and santize the name field.
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre(
      { name: req.body.name }
    );

    if (!errors.isEmpty()) {
        console.log(`errors: ${errors.array()[0].msg}`)
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre/genre-edit-create',{
          pageTitle: 'Update Genre',
          genre: genre,
          errors: errors.array(),
          editing: true,
          path: '/catalog/bookinstances'
      });
      return;
    }
    else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ 'name': req.body.name })
        .exec( function(err, found_genre) {
           if (err) { return next(err); }

           if (found_genre) {
             // Genre exists, redirect to its detail page.
             res.redirect(found_genre.url);
           }
           else {
            const genreId = req.body.genreid;
            const updatedGenreName = req.body.name
            Genre.findById(genreId)
              .then(genre => {
                genre.name = updatedGenreName;
                return genre.save()
              })
              .then(result => {
                console.log('Genre Updated!')
                console.log(`result after update: ${result}`)
                res.redirect(result.url)
              })
              .catch(err => {
                console.log(`Error tapdim: ${err}`);
            })
           }

         });
    }
  }
]

// delete
exports.getGenreDelete = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.genreId);
  async.parallel({
      genre: function(callback){
          Genre.findById(id).exec(callback)
      },
      genre_books: function(callback){
          Book.find({ 'genre': id }).exec(callback)
      },
  }, function(err, results){
      if (err) { return next(err); }

      if (results.genre==null) { // No results.
          res.redirect('/catalog/genres');
      }
      // Successful, so render.
      res.render('genre/genre-delete', {
          pageTitle: 'Delete Genre',
          genre: results.genre,
          genre_books: results.genre_books,
          path: '/catalog/bookinstances'
      })
  })
}

exports.postGenreDelete = (req, res, next) => {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.body.genreid).exec(callback)
    },
    genre_books: function(callback) {
      Book.find({ 'genre': req.body.genreid }).exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    // Success
    if (results.genre_books.length > 0) {
        // Genre has books. Render in same way as for GET route.
        res.render('genrer/genre-delete', {
            pageTitle: 'Delete Genre',
            genre: results.genre,
            genre_books: results.genre_books
        });
        return;
    }
    else {
        // Genre has no books. Delete object and redirect to the list of genress.
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
            if (err) { return next(err); }
            // Success - go to genre list
            res.redirect('/catalog/genres')
        })
    }
});
}
