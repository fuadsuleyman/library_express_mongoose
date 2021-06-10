exports.getUsers = (req, res, next) => {
    res.render('users', {
      pageTitle: 'Users Page',
      text: 'Salam Aleykum Users'
    });
};
  