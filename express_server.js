var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
let sixchar = ""
  for(var i = 0; i < 6; i++){
    sixchar += characters[Math.floor(Math.random() * characters.length)];
  }
    return sixchar;
}



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
     username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//routing to urls_new
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


app.post("/login", (req, res) => {
  res.cookie("username", req.body['usrnme']);
  res.redirect("/urls");
});


// routing to urls_show.ejs
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  longURL: urlDatabase[req.params.id],
  username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body['fname'];
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  let tiny = generateRandomString()

  while(urlDatabase.hasOwnProperty(req.params.shortURL) === true){
    let tiny = generateRandomString();
  }

  if(req.body.longURL.slice(0, 3) === "www"){
    let fixedURL = `https://${req.body.longURL}`;
    urlDatabase[tiny] = fixedURL;
    res.send(`${tiny} - ${fixedURL}`);
    console.log(urlDatabase);

  }else{

    urlDatabase[tiny] = req.body.longURL;
    console.log(urlDatabase);
    res.send(`${tiny} - ${req.body.longURL}`);
}});



app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});




