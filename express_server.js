//Require express and Initialize expresss
const express = require("express");
const app = express();

//Require and Use morgan
const morgan = require('morgan');
app.use(morgan('dev'));


//Require and use Cookie Parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//Sets Ejs as templating engine
app.set("view engine", "ejs");

//Require and Use Body Parser Library to acccess Post Request Parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let result = "";
  const possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) { 
    result += possibilities.charAt(Math.floor(Math.random() * possibilities.length)); 
  }

  return result;
};

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Creates an users Database 
const usersDB = { 
  "user1RandomID": {
    id: "user1RandomID",
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


//========= GET METHODS ======

app.get("/urls", (req, res) => {
  const currentUser = usersDBLookup(req.cookies["user_id"]);
  //console.log(req.cookies["user_id"]);
  let templateVars = { 
    urls: urlDatabase, 
    user: usersDB,
    currentUser: currentUser,
  };
  
  res.render("urls_index", templateVars);
});

//Get Route to Show the Form
//The new route matches :id pattern, so defining it before will take precedence.
app.get("/urls/new", (req, res) => {
  const currentUser = usersDBLookup(req.cookies["user_id"]);
  let templateVars = {
    currentUser: currentUser,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = usersDBLookup(req.cookies["user_id"]);
  let templateVars = { shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: user
  };
  res.render("urls_show", templateVars);
});

//Get/u/Generic Short UTRL
app.get("/u/:shortURL", (req, res) => {
  const user = usersDBLookup(req.cookies["user_id"]);
  let templateVars = {
    user: user,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.redirect(templateVars.longURL);
});

//Get/Registration Page
app.get("/register", (req, res) => {
 
  res.render("urls_register");
})

//Get/Login
app.get("/login", (req, res) => {
  res.render("urls_login");
})

//Pass entire User Object 
function usersDBLookup (userID) {
  for (key in usersDB) {
    if (userID === key) {
      return usersDB[key];
    }
  }
}

//========== POST METHODS ===========

//Post /URLS
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/");
});

//Post/Remove an URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Post/Update an URL
//Set id to params
//Change longURL to the new value of newURL
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

//Post/Login
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let validation = false;

  if (!email || !password) {
    res.status(403).render('urls_login', {error: 'Please enter a valid e-mail address and password'} ) 
  } else {
    for (var userID in usersDB) {
      let user = usersDB[userID];
      if (email === user.email && password === user.password) {
        validation = true;
        res.cookie("user_id", user.id);
        res.redirect("/urls");
      }
    }
    if (!validation){
      res.status(403).render('urls_login', {error: 'Wrong Password'} ) ;
    } 
  } 
});

//Post/Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//Post/Register
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  //Check for Errors
  let validation = true;
  let error = "";

  if (!email ||!password) {
    validation = false;
    res.status(400);
    // error: "Please enter your email address";
    res.redirect("/register");
  } 
  for (user in usersDB) {
    if (email === usersDB[user].email) {
      console.log(email === usersDB[user].email)
      validation = false;
      res.status(400);
      // error: "This e-mail address is already registered. Please enter a different one";
      res.redirect("/register");
    }
  }

  //Adds newUser to User Object
  if (validation) {
    let user = {
      id: generateRandomString(),
      email: email,
      password: password 
    }; 
    
    usersDB[user.id] = user;
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }

});


