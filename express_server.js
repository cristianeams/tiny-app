//Require express and Initialize expresss
const express = require("express");
const app = express();

//Require  and use morgan
const morgan = require('morgan');
app.use(morgan('dev'));

//Start the server
var PORT = 8080;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

//Sets Ejs as templating engine
app.set("view engine", "ejs");

//Use Body Parser Library to acccess Post Request Parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
    var result = "";
    const possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 6; i++) { 
      result += possibilities.charAt(Math.floor(Math.random() * possibilities.length)); 
    }
    
    return result;
};

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Get Route to Show the Form
//The new route matches :id pattern, so defining it before will take precedence.
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls/");
});

//Post route to remove an URL
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
   res.redirect("/urls");
});

//Post route to update an URL
//Set id to params
//Change longURL to the new value of newURL
app.post("/urls/:id", (req, res) => {
    let id = req.params.id;
    var longURL = req.body.longURL;
    urlDatabase[id] = longURL;
   res.redirect("/urls");

});


app.get("/u/:shortURL", (req, res) => {
    //console.log(req.params.shortURL)
    var longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});





