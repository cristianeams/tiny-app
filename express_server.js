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

  return result
};

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//Get Route to Show the Form
//The new route matches :id pattern, so defining it before will take precedence.
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

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
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

//Post/Logout
app.post("/logout", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.clearCookie('username', templateVars);
  res.redirect("/urls");
});

//Post/Register
app.post("/register", (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password
  };
  console.log(templateVars)
  res.redirect("/register");
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    longURL: urlDatabase[req.params.shortURL]
  };
  res.redirect(templateVars.longURL);
});
//Get/Registration Page
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_register", templateVars);
})




