const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const mongoose = require('mongoose');
const async = require('async');
const { body,validationResult } = require('express-validator');

exports.getAllBookinstances = (req, res, next) => {
    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstance){
            if (err){ return next(err); }
            // Successful, so render
            console.log(`list book: ${list_bookinstance}`)
            res.render('bookinstance/bookinstance-list', {
                pageTitle: 'Bookinstances Page',
                text: 'Welcome to Bookinstances Page',
                bookinstances: list_bookinstance,
                path: '/catalog/bookinstances'
        })
    })
}

exports.getBookinstance = (req, res, next) => {
    id = mongoose.Types.ObjectId(req.params.bookinstanceId);
    BookInstance.findById(id)
    .populate('book')
    .exec(function (err, bookinstance){
        if (err) { return next(err); }
        if (bookinstance==null) { // No results.
            let err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance/bookinstance-detail', {
            pageTitle: `Copy: ${bookinstance.book.title}`,
            text: 'Welcome to single Bookinstances Page',
            bookinstance: bookinstance,
            path: '/catalog/bookinstances'
        })
    })
}

// create
exports.getBookinstanceCreate = (req, res, next) => {
    Book.find({}, 'title')
    .exec(function(err, books) {
        if (err) { return next(err); }
        // seccessfull
        res.render('bookinstance/bookinstance-edit-create', {
            pageTitle: 'Create Bookinstance',
            book_list: books,
            editing: false,
            errors: '',
            bookinstance: '',
            path: '/catalog/bookinstance/create'
        })
    })
}

exports.postBookinstanceCreate = [
    // Validate and sanitise fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance/bookinstance-edit-create', {
                        pageTitle: 'Create BookInstance',
                        book_list: books,
                        selected_book: bookinstance.book._id,
                        errors: errors.array(),
                        bookinstance: bookinstance,
                        editing: false,
                        path: '/catalog/bookinstance/create'
                     });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
]

// update
exports.getBookinstanceUpdate = (req, res, next) => {
    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.bookinstanceId).populate('book').exec(callback);
        },
        books: function(callback) {
            Book.find(callback);
        }
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.bookinstance==null) { // No results.
                var err = new Error('Bookinstance not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('bookinstance/bookinstance-edit-create', {
                pageTitle: 'Update Bookinstance',
                book_list: results.books,
                selected_book: results.bookinstance.book._id,
                bookinstance: results.bookinstance,
                editing: true,
                errors: '',
                path: '/catalog/bookinstances'
             });
        });
}

exports.postBookinstanceUpdate = [
    // Validate and sanitise fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var bookinstance = new Book(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values and error messages.
        async.parallel({
            bookinstance: function(callback) {
                BookInstance.findById(req.params.bookinstanceId).populate('book').exec(callback);
            },
            books: function(callback) {
                Book.find(callback);
            }
            }, function(err, results) {
                if (err) { return next(err); }
                if (results.bookinstance==null) { // No results.
                    var err = new Error('Bookinstance not found');
                    err.status = 404;
                    return next(err);
                }
                // Success.
                res.render('bookinstance/bookinstance-edit-create', {
                    pageTitle: 'Update Bookinstance',
                    book_list: results.books,
                    selected_book: results.bookinstance.book._id,
                    bookinstance: results.bookinstance,
                    errors: errors.array(),
                    editing: true,
                    path: '/catalog/bookinstances'
                 });
            });
        }
        else {
            const bookinstanceId = req.body.bookinstanceid;
            const updatedBook = req.body.book;
            const updatedImprint = req.body.imprint;
            const updatedStatus = req.body.status;
            const updateDue_back = req.body.due_back;
            BookInstance.findById(bookinstanceId)
            .then(bookinstance => {
                bookinstance.book = updatedBook;
                bookinstance.imprint = updatedImprint;
                bookinstance.status = updatedStatus;
                bookinstance.due_back = updateDue_back;
                return bookinstance.save() 
            })
            .then(result => {
                console.log('Bookinstance Updated!')
                console.log(`result after update: ${result}`)
                res.redirect(result.url)
            })
            .catch(err => {
                console.log(`Error tapdim: ${err}`);
            })
        }
        
    }

]


// delete
exports.getBookinstanceDelete = (req, res, next) => {
    id = mongoose.Types.ObjectId(req.params.bookinstanceId);
    BookInstance.findById(id)
    .populate('book')
    .exec(function (err, bookinstance){
        if (err) { return next(err); }
        if (bookinstance==null) { // No results.
            res.redirect('/catalog/bookinstances');
        }
        res.render('bookinstance/bookinstance-delete', {
            pageTitle: `Delete Bookintance`,
            bookinstance: bookinstance,
            path: '/catalog/bookinstances'
        })
    })    
}


exports.postBookinstanceDelete = (req, res, next) => {
    BookInstance.findById(req.body.bookinstanceid)
    .populate('book')
    .exec(function (err, bookinstance){
        if (err) { return next(err); }
        BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookinstance(err) {
            if (err) { return next(err); }
            // Success - go to bookinstance list
            res.redirect('/catalog/bookinstances')
        })
    })
}
