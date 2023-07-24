const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
const port = 3002;

// Connection URL and database name
mongoose.connect('mongodb://127.0.0.1:27017/website', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Define a schema for the user collection
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Define a schema for the data collection
const dataSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String, 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create the Data model
const Data = mongoose.model('Data', dataSchema);

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  if (req.path !== '/login' && req.path !== '/signup' && !req.session.loggedIn) {
    res.redirect('/login');
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    const errorMessage = req.query.error;
    res.render('login', { error: errorMessage });
  }
});

app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (username === 'admin' && email === 'Admin@mail.com' && password === 'admin') {
      req.session.loggedIn = true;
      req.session.isAdmin = true;
      req.session.username = username;
      return res.redirect('/admin');
    }

    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.redirect('/login?error=User not found');
    }

    if (password === user.password) {
      req.session.loggedIn = true;
      req.session.isAdmin = false;
      req.session.userId = user._id;
      req.session.username = username;
      req.session.email = user.email;
      return res.redirect('/');
    } else {
      return res.redirect('/login?error=Incorrect password');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});


app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const newUser = new User({
    username,
    email,
    password,
  });

  newUser
    .save()
    .then(() => {
      console.log('User saved successfully');
      res.redirect('/login');
    })
    .catch((err) => {
      console.error('Error saving user:', err);
      res.render('signup', { error: 'An error occurred' });
    });
});

// Render the home page with the message variable
app.get('/', async (req, res) => {
  if (req.session.email && req.session.username) {
    try {
      const data = await Data.find({ user: req.session.userId });

      if (data && data.length > 0) {
        const message = req.session.message; // Get the message from the session
        req.session.message = null; // Clear the message after retrieving

        res.render('home', { user: req.session.username, data, errorMessage: null, message });
      } else {
        const errorMessage = 'No data available';
        res.render('home', { user: req.session.username, data: [], errorMessage, message: null });
      }
    } catch (err) {
      console.error(err);
      res.render('error', { error: err });
    }
  } else {
    res.redirect('/login');
  }
});




app.post('/upload', upload.array('image'), async (req, res) => {
  try {
    const image = req.files[0];
    const newImage = new Data({
      title: req.body.title,
      description: req.body.description,
      image: image.filename,
      user: req.session.userId,
    });
    await newImage.save();
    
    // Set a success message in the session
    req.session.message = {
      type: "success",
      message: "Image uploaded successfully!",
    };

    res.redirect('/');
  } catch (error) {
    res.render('error', { error });
    console.log("errorrrrr" + error);
  }
});





app.get('/edit/:id', async (req, res) => {
  try {
    const cardId = req.params.id;

    const image = await Data.findById(cardId);

    // Set a success message in the session
    req.session.message = {
      type: "success",
      message: "Image updated successfully!",
    };

    res.render('edit', { image });
    console.log("Displayed");
  } catch (error) {
    res.render('error', { error });
    console.log("Not displayed");
  }
});

app.post('/edit/:id', async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedData = req.body;

    await Data.findByIdAndUpdate(cardId, updatedData);

    req.session.message = {
      type: "success",
      message: "Image updated successfully!",
    };

    res.redirect('/');
  } catch (error) {
    res.render('error', { error });
  }
});

app.get('/delete/:id', async (req, res) => {
  try {
    const cardId = req.params.id;

    await Data.findByIdAndDelete(cardId);
    req.session.message = {
      type: "success",
      message: "Image deleted successfully!",
    };

    res.redirect('/');
  } catch (error) {
    res.render('error', { error });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie('user');
      const errorMessage = 'Logout Successfully';
      res.render('login', { error: errorMessage });
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
