const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

exports.getAllAuthors = (req, res, next) => {
    Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, author_list){
        if (err){ return next(err); }
        res.render('author/author-list', {
            pageTitle: 'Authors Page',
            text: 'Welcome to greate authors Page',
            authors: author_list,
            path: '/catalog/authors'
        })
    })
}

exports.getAuthor = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.authorId);
    console.log(`getAuthor-de id: ${id}`)
    async.parallel({
        author: function(callback){
            Author.findById(id)
            .exec(callback)
        },
        author_books: function(callback){
            Book.find({ 'author': id },'title summary')
            .exec(callback)
        }
    },function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author/author-detail', {
            pageTitle: 'Author Detail',
            text: 'Welcome to single author Page',
            author: results.author,
            author_books: results.author_books,
            path: '/catalog/authors'
        })
    })    
}



// create
exports.getAuthorCreate = (req, res, next) => {
    res.render('author/author-edit-create', {
        pageTitle: 'Create Author',
        text: 'Time to create new Author!',
        editing: false,
        errors: '',
        path: '/catalog/author/create'
    })
}

exports.postAuthorCreate = [
    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        console.log(`first_name: ${req.body.first_name}`)
        // Create an Author object with escaped and trimmed data.
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author/author-edit-create', {
                pageTitle: 'Create Author',
                editing: false,
                author: author,
                errors: errors.array(),
                path: '/catalog/author/create'
             });
            return;
        }
        else {
            // Data from form is valid.
            author.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(author.url);
            });
        }
    }
]

// update
exports.getAuthorUpdate = (req, res, next) => {
    console.log('getAuthorUpdate-e daxil oldum!')
    Author.findById(req.params.authorId)
    .exec(function (err, author){
        if (err) { return next(err); }
        if (author==null) { // No results.
            let err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author/author-edit-create', {
            pageTitle: `Update Author: ${author.name}`,
            author: author,
            path: '/catalog/authors',
            errors: '',
            editing: true
        })
    })
}

exports.postAuthorUpdate = [

    // Validate and sanitise fields.
    body('first_name', 'First name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('family_name', 'Family name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        console.log('Post update-de ilk middleware-nin icindeyem')

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Author object with escaped/trimmed data and old id.
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id:req.params.id
            });
        if (!errors.isEmpty()) {
            console.log('Error-a girdi author update post-da')
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author/author-edit-create', {
                pageTitle: 'Update Author',
                editing: true,
                author: author,
                errors: errors.array(),
                path: '/catalog/authors'
            });
            return;
        }else {
            const authorId = req.body.authorid;
            const updatedFirst_name = req.body.first_name;
            const updatedFamily_name = req.body.family_name;
            const updatedDate_of_birth = req.body.date_of_birth;
            const updatedDate_of_death = req.body.date_of_death;
            console.log('Else-ye girmishem updatede')
            Author.findById(authorId)
            .then(author => {
                author.first_name = updatedFirst_name;
                author.family_name = updatedFamily_name;
                author.date_of_birth = updatedDate_of_birth;
                author.date_of_death = updatedDate_of_death;
                return author.save() 
            })
            .then(result => {
                console.log('Author Updated!')
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
exports.getAuthorDelete = (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.authorId);
    async.parallel({
        author: function(callback){
            Author.findById(id).exec(callback)
        },
        author_books: function(callback){
            Book.find({ 'author': id }).exec(callback)
        },
    }, function(err, results){
        if (err) { 
            return next(err); }

        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author/author-delete', {
            pageTitle: 'Delete Author',
            author: results.author,
            author_books: results.author_books,
            path: '/catalog/authors'
        })
    })
}

exports.postAuthorDelete = (req, res, next) => {
    // const id = mongoose.Types.ObjectId(req.body.authorId);
    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        author_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.author_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author/author-delete', {
                pageTitle: 'Delete Author',
                author: results.author,
                author_books: results.author_books,
                path: '/catalog/authors' 
            });
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
}
