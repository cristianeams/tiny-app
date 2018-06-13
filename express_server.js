//Require express
var express = require("express");
var app = express();

//Default port
var PORT = 8080;

//Sets Ejs as templating engine
app.set("view engine", "ejs");

//Use Body Parser Library to acccess Post Request Parameters
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
    var result = '';
    const possibilities = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) { 
      result += possibilities.charAt(Math.floor(Math.random() * possibilities.length)); 
    }
      return result;
};
  
  generateRandomString();


var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

// app.get("/", function (req, res) {
//     res.end("Hello");

// });

// app.get("/urls.json", function (req, res) {
//     res.json(urlDatabase);
// })

// app.get("/hello", function (req, res) {
//     res.end("<html><body>Hello <b> World</b></html>\n");

// });
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
    console.log(req.body);  // debug statement to see POST parameters
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
  });

app.listen(PORT, function () {
    console.log(`Example app listening on port ${PORT}`);
});


