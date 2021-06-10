const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express()
const port = 3000

// import routes
const indexRoutes = require('./routes/index');
const usersRoutes = require('./routes/users');
const bookRoutes = require('./routes/book');
const bookinstanceRoutes = require('./routes/bookinstance');
const genreRoutes = require('./routes/genre');
const authorRoutes = require('./routes/author');

const errorController = require('./controllers/error');


app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/users', usersRoutes);
app.use('/', indexRoutes);

app.use('/catalog', bookRoutes);
app.use('/catalog', bookinstanceRoutes);
app.use('/catalog', genreRoutes);
app.use('/catalog', authorRoutes);
app.use(errorController.getErrorPage);


// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

// {useNewUrlParser: true, useUnifiedTopology: true}

mongoose.connect(
    'mongodb+srv://fuad:wLoyopyig03cXY9a@cluster0.4cvrs.mongodb.net/library?retryWrites=true&w=majority',
    {useNewUrlParser: true, useUnifiedTopology: true}
)
.then(result => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});
  
// app.listen(port, () => {
// console.log(`Example app listening at http://localhost:${port}`)
// })