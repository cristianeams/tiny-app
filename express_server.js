//Require Initialize expresss
const express = require("express");
const app = express();

//Require morgan
const morgan = require('morgan');
app.use(morgan('dev'));

//Require cookie-session
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'user_id',
  keys: ['key1', 'key2'],
}));

//Require BCCryptJS
const bcrypt = require('bcryptjs');

//Require body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Sets Ejs as templating engines
app.set("view engine", "ejs");

//Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Tiny App running on port ${PORT}`);
});


//=======Databases =========

let urlDatabase = {
  "b2xVn2": {url: "http://www.lighthouselabs.ca", userId: 'user1RandomID'},
  "9sm5xK": {url: "http://www.google.com", userId: 'user2RandomID'},
};

const usersDB = { 
  "admin": {
    id: "admin",
    email: "123@123",
    hashedPassword: bcrypt.hashSync("123", 10)
  }
};

//======Functions ======

function generateRandomString() {
  let result = "";
  const possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) { 
    result += possibilities.charAt(Math.floor(Math.random() * possibilities.length)); 
  }
  return result;
};

function urlsForUser(id) {
  const result = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userId) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
};

//Pass entire User Object 
function usersDBLookup (userID) {
  for (key in usersDB) {
    if (userID === key) {
      return usersDB[key];
    }
  }
};

function validateLogin(data){
  let email = data.email;
  let password = data.password;
  for(let key in usersDB) {
    let user = usersDB[key];
    if (user.email === email && bcrypt.compareSync(password, user.hashedPassword)) {
      return user;
    }
  }
  return false;
};

//========= GET METHODS ======

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const currentUser = usersDBLookup(req.session.user_id);
  if (!currentUser) {
    res.redirect("/login");
    return;
  } 
  let templateVars = { 
    urls: urlsForUser(currentUser.id), 
    user: usersDB,
    currentUser: currentUser,
  };
  res.render("urls_index", templateVars);
});

//Get/New Links 
app.get("/urls/new", (req, res) => {
  const currentUser = usersDBLookup(req.session.user_id);
  let templateVars = {
    urls: urlDatabase, 
    currentUser: currentUser,
  };
  if (currentUser) {
    res.render("urls_new", templateVars);
  }else {
    res.redirect("/login");
  }
});

//Get/URLS
app.get("/urls/:id", (req, res) => {
  const user = usersDBLookup(req.session.user_id);
  if (user === undefined ) {
    return res.redirect("/login");
  }
  let shortURL = req.params.id;
  let urlObject = urlDatabase[shortURL];
  if (user.id !== urlObject.userId) {
    res.status(401).send("You are not authorized.");
    return;
  }
  let templateVars = { shortURL: shortURL,
    longURL: urlDatabase[shortURL].url, 
    currentUser: user
  };
  res.render("urls_show", templateVars);
});

//Get/Public
app.get("/public", (req, res) => {

  const user = usersDBLookup(req.session.user_id);
  let templateVars = { 
    urls: urlDatabase,
    currentUser: user,
  };
  res.render("urls_public", templateVars);
});

//Get/u/Generic Short UTRL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].url;

  res.redirect(longURL);
});

//Get/Registration 
app.get("/register", (req, res) => {
  res.render("urls_register");
})

//Get/Login
app.get("/login", (req, res) => {
  res.render("urls_login");
})

//========== POST METHODS ===========

//Post/URLS
app.post("/urls", (req, res) => {
  let currentUser = req.session.user_id;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let templateVars = {
    'userId': currentUser,
    'url': longURL
  };
  urlDatabase[shortURL] = templateVars;
  res.redirect("/urls/");
  
});

//Post/Remove an URL
app.post("/urls/:id/delete", (req, res) => {
  let userId = req.session.user_id
  const {id} = req.params;
  if (userId === urlDatabase[id].userId ) {
    delete urlDatabase[id];
    return res.redirect("/urls");
  } else {
    return res.status(403).render('urls_index', {error: 'You dont have permission to delete this file'} ) ;
  }
});

//Post/Update an URL
app.post("/urls/:id", (req, res) => {
  let userId = req.session.user_id
  let urlID = urlDatabase[req.params.id];
  if (urlID.userId === userId) {
    urlID.longURL = req.body.longURL;
    //Updates longURL in database
    urlDatabase[req.params.id].url = urlID.longURL;
    res.redirect("/urls");
  }
  else {
    res.send(401);
    return;
  }
});

//Post/Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  const data = {
    email: email,
    password: password
  }
  const validUser = validateLogin(data);
  
  if(validUser) {
    req.session.user_id = validUser.id;
    res.redirect("/urls");
  } else {
    res.render('urls_login', {error: 'You are not an user. Please register to use Tiny App.'} ) ;
    return;
  }
});
 
//Post/Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Post/Register
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  console.log(email);
  console.log(password);
  console.log(hashedPassword);

  //Check for Errors
  let validation = true;

  if (!email || !password) {
    validation = false;
    // res.status(400);
    res.status(400).render('urls_register', {error: 'Please enter a valid e-mail address and password'});
    // res.redirect("/register");
  } 
  for (user in usersDB) {
    if (email === usersDB[user].email) {
      validation = false;
      res.status(400);
      res.redirect("/register");
    }
  }

  if (validation) {
    let user = {
      id: generateRandomString(),
      email: email,
      hashedPassword
    }; 
    //Adds user to usersDB
    usersDB[user.id] = user;
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});


