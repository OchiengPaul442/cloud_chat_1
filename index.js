const path = require("path");
const http = require("http"); // create http server
const mysql = require("mysql");
const express = require("express");
const socketio = require("socket.io"); // create socket server
const bcrypt = require("bcrypt");
const formatMessage = require("./helpers/formatDate");
const app = express(); // create express app
const server = http.createServer(app); // create server
const socketioClient = require("socket.io-client");
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const csp = require("content-security-policy");
const session = require("express-session");
const sessionStore = new session.MemoryStore();
const CryptoJS = require("crypto-js");
const readline = require("readline");
let clientConnection = "";

// ********************************************************************************* //
// PORT TO RUN SERVER
// ********************************************************************************* //
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// secret key for encryption
const secretKey = "secret key 123456789";

// content security policy header
const cspPolicy = csp.getCSP({
  directives: {
    "default-src": csp.SRC_SELF,
    "script-src": [csp.SRC_SELF, csp.SRC_UNSAFE_INLINE],
    "style-src": [csp.SRC_SELF, csp.SRC_UNSAFE_INLINE],
    "img-src": [csp.SRC_SELF, "data:"],
    "font-src": [csp.SRC_SELF, "data:"],
    "connect-src": [csp.SRC_SELF, "ws://localhost:3000"],
    "frame-src": [csp.SRC_SELF],
    "object-src": [csp.SRC_SELF],
    "media-src": [csp.SRC_SELF],
    "worker-src": [csp.SRC_SELF],
    "child-src": [csp.SRC_SELF],
    "form-action": [csp.SRC_SELF],
    "frame-ancestors": [csp.SRC_NONE],
    "base-uri": [csp.SRC_NONE],
    "plugin-types": [csp.SRC_NONE],
    sandbox: [csp.SANDBOX_ALLOW_FORMS, csp.SANDBOX_ALLOW_SCRIPTS],
    "report-uri": "/report-violation",
    "require-sri-for": csp.REQUIRE_SRI_FOR_SCRIPT_STYLE,
    "block-all-mixed-content": true,
    "upgrade-insecure-requests": true,
  },
});

const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers,
} = require("./helpers/userHelper");
const { get } = require("jquery");

// Set public directory
app.use(express.static(path.join(__dirname, "public")));

// ********************************************************************************* //
// API Middleware
// ********************************************************************************* //
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// This will apply this policy to all requests if no local policy is set
app.use(cspPolicy);

// ********************************************************************************* //
// SESSION MIDDLEWARE
// ********************************************************************************* //
app.use(
  session({
    secret: "my-secret", // used to sign the session ID cookie
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: true, // only send session ID cookie if the request originated from the same site
      secure: false, // only send session ID cookie over HTTPS
    },
  })
);

// sessionstore
app.use((req, res, next) => {
  req.sessionStore = sessionStore;
  next();
});

// ********************************************************************************* //
// connection to mysql database
// ********************************************************************************* //
// define database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "live_chat",
});

// connect to database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connected...");
});

// ********************************************************************************* //
// Auth Routes
// ********************************************************************************* //
// register user
app.get("/registerForm", (req, res) => {
  // get username, email and password from form
  let user_name = req.query.user_name;
  let user_email = req.query.user_email;
  let user_password = req.query.user_password;

  // check if user already exists
  let sql_ = `SELECT * FROM users_details WHERE user_email = '${user_email}' or user_name = '${user_name}'`;
  db.query(sql_, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.redirect("/register?msg=user exists");
    } else {
      // check if email is valid
      if (!user_email.includes("@") || !user_email.includes(".")) {
        res.redirect("/register?msg=email not valid");
      } else {
        // check if password is strong
        if (user_password.length < 8) {
          res.redirect("/register?msg=password too short");
        } else if (user_password.search(/[a-z]/i) < 0) {
          res.redirect("/register?msg=password must contain letters");
        } else if (user_password.search(/[0-9]/) < 0) {
          res.redirect("/register?msg=password must contain numbers");
        } else if (
          user_password.search(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/) < 0
        ) {
          res.redirect(
            "/register?msg=password must contain special characters"
          );
        } else {
          // prevent sql injection
          user_name = user_name.replace(/'/g, "\\'");
          user_email = user_email.replace(/'/g, "\\'");
          user_password = user_password.replace(/'/g, "\\'");

          // hash user_password before storing in database
          let saltRounds = 10;
          let myPlaintextPassword = user_password;
          let hashed_pass = bcrypt.hashSync(myPlaintextPassword, saltRounds);
          // get random number for profile picture
          let random_number = Math.floor(Math.random() * 5) + 1;
          let profile_picture = `profile${random_number}.jpg`;
          // insert into database
          let sql = `INSERT INTO users_details (user_name, user_email ,user_password,profile_img) VALUES ('${user_name}', '${user_email}', '${hashed_pass}', '${profile_picture}')`;
          db.query(sql, (err, result) => {
            if (err) throw err;
            res.redirect("/?msg=registered successfully");
          });
        }
      }
    }
  });
});

// login user
app.get("/loginForm", (req, res) => {
  // get username,password and room  from form
  let user_name = req.query.username;
  let user_password = req.query.password;
  let room = req.query.room;

  // prevent sql injection
  user_name = user_name.replace(/'/g, "\\'");
  user_password = user_password.replace(/'/g, "\\'");

  // check if user exists
  let sql_ = `SELECT * FROM users_details WHERE user_email like '${user_name}' or user_name like '${user_name}'`;
  db.query(sql_, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      // check if password matches
      let hashed_pass = result[0].user_password;
      let match = bcrypt.compareSync(user_password, hashed_pass);
      if (match) {
        // check if user is already in room
        let user = getActiveUser(user_name);
        if (user) {
          exitRoom(user);
        } else {
          // set session variables
          req.session.user_name = user_name;
          req.session.room = room;
          req.session.image = result[0].profile_img;
          req.session.id = result[0].id;

          // if user status is 0 then proceed else redirect to index page
          if (result[0].user_status == 0) {
            let stats = 1;
            let statusUpdate = `UPDATE users_details SET user_status = '${stats}' WHERE user_name = '${user_name}'`;
            db.query(statusUpdate, (err, result_) => {
              if (err) throw err;
              // redirect to chat page
              if (req.session.user_name && req.session.id && req.session.room) {
                res.redirect(
                  `/chat?username=${user_name}&room=${room}&image=${result[0].profile_img}`
                );
              } else {
                res.redirect("/");
              }
            });
          } else {
            res.redirect("/?loginerror= user already logged in");
          }
        }
      } else {
        res.redirect("/?loginerror= password is incorrect");
      }
    } else {
      res.redirect("/?loginerror= user does not exist");
    }
  });
});

// ********************************************************************************* //
// define app routes
// ********************************************************************************* //
// index page
app.get("/", (req, res) => {
  // check if user is logged in
  if (req.session.user_name && req.session.id && req.session.room) {
    res.redirect("/chat");
  } else {
    res.sendFile(path.join(__dirname + "/public/index.html"));
  }
});

// chat page
app.get("/chat", (req, res) => {
  // check if user is logged in
  if (req.session.id) {
    res.sendFile(path.join(__dirname + "/public/chat.html"));
  } else {
    // set status to offline
    let sql_ = `UPDATE users_details SET user_status = '0' WHERE user_name = '${req.session.user_name}'`;
    db.query(sql_, (err, result) => {
      if (err) throw err;
      // destroy session
      req.session.destroy();
      // redirect to index page
      res.redirect("/?loginerror=login to access chat");
    });
  }
});

// register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/register.html"));
});

// logout
app.get("/logout", (req, res) => {
  // set user_status to offline
  let stats = 0;
  let sql_ = `UPDATE users_details SET user_status = '${stats}' WHERE user_name = '${req.session.user_name}'`;
  db.query(sql_, (err, result) => {
    if (err) throw err;
    // destroy session
    req.session.destroy();
    // redirect to index page
    res.redirect("/");
  });
});

// ********************************************************************************* //
// THIS BLOCK RUNS WHEN USER CONNECTS TO SOCKET
// ********************************************************************************* //
io.on("connection", (socket) => {
  try {
    // connect port
    socket.on("connectPort", (port) => {
      console.log("port connected");
      clientConnection = port;
      getPort(clientConnection);
      message = "port connected successfully go to your terminal to send messages"; 
      socket.emit("success", message);
    });
    // ********************************************************************************* //
    // JOIN ROOM
    // ********************************************************************************* //
    socket.on("joinRoom", ({ username, room }) => {
      const user = newUser(socket.id, username, room);

      socket.join(user.room);

      // General welcome
      socket.emit(
        "message",
        formatMessage("CloudChat", "Messages are limited to this room! ")
      );

      // set user status to 1
      let stats = 1;
      let statusUpdate = `UPDATE users_details SET user_status = '${stats}' WHERE user_name = '${username}'`;
      db.query(statusUpdate, (err, result) => {
        if (err) throw err;
      });

      // broadcast chat history from database
      let sql = `SELECT * FROM messages WHERE chat_room = '${user.room}'`;
      db.query(sql, (err, result) => {
        if (err) throw err;
        // decrypt the message
        for (let i = 0; i < result.length; i++) {
          const decrypted = CryptoJS.AES.decrypt(result[i].message, secretKey);
          result[i].message = decrypted.toString(CryptoJS.enc.Utf8);
        }
        socket.emit("chatHistory", result);
      });

      // Broadcast everytime users connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(
            "CloudChat_join",
            `${user.username} has joined the room`
          )
        );

      // Current active users and room name
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getIndividualRoomUsers(user.room),
      });
    });

    // ********************************************************************************* //
    // Listen for client message
    // ********************************************************************************* //
    socket.on("chatMessage", ({ msg, image }) => {
      const user = getActiveUser(socket.id);

      // prevent sql injection
      msg = msg.replace(/'/g, "''");
      image = image.replace(/'/g, "''");

      // select user profile image
      let sql_ = `SELECT profile_img FROM users_details WHERE user_name = '${user.username}'`;
      db.query(sql_, (err, result) => {
        if (err) throw err;
        image = result[0].profile_img;
        io.to(user.room).emit(
          "message",
          formatMessage(user.username, msg, image)
        );
      });

      // Encrypt the message
      let encrypted = CryptoJS.AES.encrypt(msg, secretKey).toString();

      // save message to database with user id
      let sql = `INSERT INTO messages (user_id, message, chat_room,images) VALUES ('${user.username}', '${encrypted}', '${user.room}','${image}')`;
      db.query(sql, (err) => {
        if (err) throw err;
        // console.log(result);
      });
    });

    // ********************************************************************************* //
    // Runs when client disconnects
    // ********************************************************************************* //
    socket.on("disconnect", () => {
      const user = exitRoom(socket.id);

      // update user status to 0
      let stats = 0;
      let statusUpdate = `UPDATE users_details SET user_status = '${stats}' WHERE user_name = '${user.username}'`;
      db.query(statusUpdate, (err, result_) => {
        if (err) throw err;
      });

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage("cloudchat_left", `${user.username} has left the room`)
        );

        // Current active users and room name
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getIndividualRoomUsers(user.room),
        });
      }
    });
  } catch (error) {
    if (error) {
      console.log("There was an error processing your request");
    }
  }
});

// ********************************************************************************* //
// CONNECT TO OTHER SERVERs
// ********************************************************************************* //
function getPort(clientConnection) {
  console.log("clientConnection", clientConnection);
  const server1 = socketioClient(`${clientConnection}`);

  //CHECK CONNECTION TO SERVER
  server1.on("connect", () => {
    console.log("connected to server");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "ROBEX_SERVER:",

      removeHistoryDuplicates: true,

      terminal: true,

      emitKeypressEvents: true,
    });

    rl.prompt();

    rl.on("line", (input) => {
      io.emit("message", input);
      rl.prompt();
    });

    server1.on("message", (msg) => {
      console.log("\nCHAT_SERVER2: " + msg);
      rl.prompt();
    });

    server1.on("disconnect", () => {
      console.log("disconnected from server");
    });

    rl.on("close", () => {
      console.log("Have a great day!");
      process.exit(0);
    });

    server1.on("error", (err) => {
      if (err) {
        console.log("error connecting to server");
      }
    });
  });
}
