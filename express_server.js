
var cookieSession = require('cookie-session');
var express = require('express');

var app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const bcrypt = require('bcrypt');


var PORT = process.env.PORT || 8080; // default port 8080

function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let sixchar = "";
  for(var i = 0; i < 6; i++){
    sixchar += characters[Math.floor(Math.random() * characters.length)];
  }return sixchar;
}

const users = {
  "a": {
    id: "a",
    email: "a@a.com",
    password: "a"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
var urlDatabase = {
  "b2xVn2": {
    userID: "a",
    link: "http://www.lighthouselabs.ca"},
  "9sm5xK": {
    userID: "b",
    link: "http://www.google.com"
  }
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


//only let the logged in user to delete.edit their link
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: JSON.stringify(users[req.session.user_id]),
    cookieid: req.session.user_id
   };
  res.render("urls_index", templateVars);
});



//routing to urls_new
//if not logged in, redirect to login page
app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    let templateVars = {
    username: JSON.stringify(users[req.session.user_id])
    };
    res.render("urls_new", templateVars);
  }else{
    res.send("please login first");

}});



//registration page
app.get("/register", (req, res) => {
  res.render("url_register");
});

//login page
app.get("/login", (req, res) => {
  let templateVars = {
  username: JSON.stringify(users[req.session.user_id])
  };
  res.render("url_login", templateVars);
});

//login only possible if username is in database
app.get("/urls/:id", (req, res) => {
  if(users[req.session.user_id]){
    if(req.session.user_id === urlDatabase[req.params.id].userID){
      let templateVars = { shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].link,
        username: JSON.stringify(users[req.session.user_id]
          )};
        res.render("urls_show", templateVars);
        return;
      }
    res.send("Please try again");
    }
  else{
    res.redirect("/register");
  }
});


function addUserToDatabase(email, password, uId) {
  let myInfo ={
    id : uId,
    email :email,
    password: password
  };
  return users[uId] = myInfo;
}

function findUserByEmail(typedEmail){
  for(var usernames in users){
    console.log(users[usernames].email, typedEmail);
    if (users[usernames].email === typedEmail){
      return true;
    }
  }return false;
}

// registration handler that adds new user to database if username and password are correctly inputted. password is encrypted
app.post("/register", (req, res) => {
  const userForEmail = findUserByEmail(req.body.email);
  if(userForEmail) {
    res.status(400).end("Email already registered");
    return;
  }
  if(req.body['email'] === "" || req.body['password'] === ""){
    res.status(400).render("url_register");
    return;
  }
  let myId = generateRandomString();
  const user = addUserToDatabase(req.body.email, bcrypt.hashSync(req.body.password, 10),myId) ;
  req.session.user_id = myId;

  res.redirect("/urls");
});


//login only possible if email and password pair matches with one in database
app.post("/login", (req, res) => {
  for(const id in users){
    if(users[id].email === req.body.email && bcrypt.compareSync(req.body.password, users[id].password)){
      req.session.user_id = id;
      res.redirect("/urls");
      return;
    }
  }
  res.status(400).end("Wrong username or password");
});


//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  if(urlDatabase[req.params.id].userID === req.session.user_id){
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }else{
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  if(!req.body['fname'].includes("http")){
    req.body['fname'] = `http://${req.body['fname']}`;
  }
  urlDatabase[req.params.id].link = req.body['fname'];
  res.redirect("/urls");
});


//generates user and adds to database
app.post("/urls", (req, res) => {
  let tiny = generateRandomString();
  while(urlDatabase.hasOwnProperty(req.params.shortURL) === true){
    let tiny = generateRandomString();
  }
  if(!req.body.longURL.includes('http')){
    req.body.longURL = `http://${req.body.longURL}`;
  }
  urlDatabase[tiny] = {
    userID: req.session.user_id,
    link: req.body.longURL
  };
    res.redirect('/urls');
});


//shortURL redirects to longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].link;
  res.redirect(longURL);
});