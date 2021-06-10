const Author = require('../models/author');
const Book = require('../models/book');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const async = require('async');
const mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

// bu middleware data olmayanda da error vermir
exports.getAllBooks = (req, res, next) => {
    Book.find({}, 'title author')
        .populate('author')
        .exec(function (err, list_book){
            if (err){ return next(err); }
            // Successful, so render
            console.log(`list book: ${list_book}`)
            res.render('book/book-list', {
                pageTitle: 'Books Page',
                text: 'Welcome to Books Page',
                books: list_book,
                path: '/catalog/books'
        })
    })
}


exports.getBook = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.bookId);
    async.parallel({
        book: function(callback) {
            Book.findById(id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {

          BookInstance.find({ 'book': id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book/book-detail', {
            pageTitle: results.book.title,
            book: results.book,
            book_instances: results.book_instance,
            path: '/catalog/books'
         } );
    });
};

// create
exports.getBookCreate = (req, res, next) => {
    async.parallel({
        authors: function (callback) {
            Author.find(callback)    
        },
        genres: function (callback) {
            Genre.find(callback)
        }    
    },function(err, results){
        if (err) { return next(err); }
        res.render('book/book-edit-create', {
            pageTitle: 'Book Create',
            authors: results.authors,
            genres: results.genres,
            editing: false,
            errors: '',
            book: '',
            path: '/catalog/book/create'
        })
    }
    )
}

exports.postBookCreate = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        let book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book/book-edit-create', {
                    pageTitle: 'Create Book',
                    authors:results.authors,
                    genres:results.genres,
                    book: book, errors:
                    errors.array(),
                    editing: false,
                    path: '/catalog/book/create'
                 });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
]

// update
exports.getBookUpdate = (req, res, next) => {
    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.bookId).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('book/book-edit-create', {
                pageTitle: 'Update Book',
                authors: results.authors,
                genres: results.genres,
                book: results.book,
                editing: true,
                errors: '',
                path: '/catalog/books'
             });
        });
}

exports.postBookUpdate = [
    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book/book-edit-create', { 
                    pageTitle: 'Update Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: book,
                    editing: true,
                    errors: errors.array(),
                    path: '/catalog/books'
                 });
            });
            return;
        }
        else {
            const bookId = req.body.bookid;
            const updatedTitle = req.body.title;
            const updatedAuthor = req.body.author;
            const updatedSummary = req.body.summary;
            const updatedIsbn = req.body.isbn;
            const updatedGenre = (typeof req.body.genre==='undefined') ? [] : req.body.genre;
            Book.findById(bookId)
            .then(book => {
                book.title = updatedTitle;
                book.author = updatedAuthor;
                book.summary = updatedSummary;
                book.isbn = updatedIsbn;
                book.genre = updatedGenre;
                return book.save() 
            })
            .then(result => {
                console.log('Book Updated!')
                console.log(`result after update: ${result}`)
                res.redirect(result.url)
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
]

// delete
exports.getBookDelete = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.bookId);
    async.parallel({
        book: function(callback) {
            Book.findById(id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {

          BookInstance.find({ 'book': id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('book/book-delete', { 
            pageTitle: 'Delete Book',
            book: results.book,
            book_instances: results.book_instance,
            path: '/catalog/books'
         } );
    });
}

exports.postBookDelete = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.body.bookid);
    async.parallel({
        book: function(callback) {
            Book.findById(id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {

          BookInstance.find({ 'book': id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book_instance==null) { // No results.
            // Book has instances. Render in same way as for GET route.
            res.render('book/book-delete', {
                pageTitle: 'Delete Book',
                book: results.book,
                book_instances: results.book_instance,
                path: '/catalog/books' 
            });
            return;
        } else {
            // Book has no instances. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - go to book list
                res.redirect('/catalog/books')
            })
        }
    });
}
