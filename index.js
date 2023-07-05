const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Middleware to check if the user is authenticated and authorized
const authenticate = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

// User data (for simplicity, stored in-memory; you should use a database in production)
const users = [
  { username: 'learner', password: 'learner123', role: 'learner' },
  { username: 'teacher', password: 'teacher123', role: 'teacher' }
];

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user based on the entered credentials
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.isAuthenticated = true;
    req.session.userRole = user.role;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
});

// Route accessible only to authenticated learners
app.get('/view', authenticate, (req, res) => {
  res.render('view');
});

// Route accessible only to authenticated and authorized teachers
app.get('/manage', (req, res) => {
  if (req.session.isAuthenticated && req.session.userRole === 'teacher') {
    res.render('manage');
  } else {
    res.redirect('/login');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
