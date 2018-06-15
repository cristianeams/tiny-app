//Require express and Initialize expresss
const express = require("express");
const app = express();

//Require and Use morgan
const morgan = require('morgan');
app.use(morgan('dev'));


//Require and use Cookie Sessions
const cookieSession = require('cookie-session')
//const cookieParser = require('cookie-parser');
//app.use(cookieSession());
app.use(cookieSession({
  name: 'user_id',
  keys: ['key1', 'key2'],
}));

//Require BCCryptJS
const bcrypt = require('bcryptjs');

//Start sserver
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//Sets Ejs as templating engine
app.set("view engine", "ejs");

//Require and Use Body Parser Library to acccess Post Request Parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//=======Databases =========

let urlDatabase = {
  "b2xVn2": {url: "http://www.lighthouselabs.ca", userId: 'user1RandomID'},
  "9sm5xK": {url: "http://www.google.com", userId: 'user2RandomID'},
  
};

//Creates an users Database 
const usersDB = { 
//   "user1RandomID": {
//     id: "user1RandomID",
//     email: "user@example.com", 
//     password: "123"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "456"
//   },
  "admin": {
    id: "admin",
    email: "123@123",
    password: bcrypt.hashSync("123", 10)
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
  //let userId = req.cookies.user_id;
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
}


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

//Get Route to Show the Form
//The new route matches :id pattern, so defining it before will take precedence.
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

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const user = usersDBLookup(req.session.user_id);
  if (!user === undefined ) {
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
    user: user
  };
  res.render("urls_show", templateVars);
});

//Get /Public
app.get("/public", (req, res) => {
  const currentUser = req.session.user_id;
  let templateVars = { 
    urls: urlDatabase,
    currentUser: currentUser,
  };
  res.render("urls_public", templateVars);
});

//Get/u/Generic Short UTRL
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//Get/Registration Page
app.get("/register", (req, res) => {
  res.render("urls_register");
})

//Get/Login
app.get("/login", (req, res) => {
  res.render("urls_login");
})



//========== POST METHODS ===========

//Post /URLS
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
    return res.sendStatus(401);
  }
});

//Post/Update an URL
//Set id to params
//Change longURL to the new value of newURL

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
  let email = req.body.email;
  let password = req.body.password;

  let validation = false;
  if (!email || !password) {
    res.status(403).render('urls_login', {error: 'Please enter a valid e-mail address and password'} ) 
  } else {
    for (var userID in usersDB) {
      let user = usersDB[userID];
      if (email === user.email ) {
        let checkedPassword = bcrypt.compareSync(password, user.password);

        if (checkedPassword){
          req.session.user_id = user.id;
          res.redirect("/urls");
        } 
     }
    }
  } 
  res.redirect("/urls");
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

  //Check for Errors
  let validations= true;

  if (!email ||!password) {
    validation = false;
    res.status(400);
    res.redirect("/register");
  } 
  for (user in usersDB) {
    if (email === usersDB[user].email) {
      validation = false;
      res.status(400);
      res.redirect("/register");
    }
  }

  //Adds newUser to User Object
  if (validation) {
    let user = {
      id: generateRandomString(),
      email: email,
      password: hashedPassword
    }; 

    usersDB[user.id] = user;
    //res.cookie("user_id", user.id);
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});


