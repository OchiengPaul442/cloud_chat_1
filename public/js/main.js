const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const current_user = document.getElementById("current_user");

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log({ username, room });

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  if (message.username === "CloudChat") {
    // show notification modal for 3 seconds
    const div = document.createElement("div");
    div.innerHTML = `<div class="text-center alert alert-info alert-dismissible fade show" role="alert">
                       ${message.text}                    
                    </div>`;
    document.querySelector(".notification").appendChild(div);
    setTimeout(
      () => document.querySelector(".notification").removeChild(div),
      3000
    );
  } else if (message.username === "CloudChat_join") {
    // show notification modal for 3 seconds
    const div = document.createElement("div");
    div.innerHTML = `<div class="text-center alert alert-success alert-dismissible fade show" role="alert">
                       ${message.text}                    
                    </div>`;
    document.querySelector(".notification").appendChild(div);
    setTimeout(
      () => document.querySelector(".notification").removeChild(div),
      3000
    );
  } else if (message.username === "cloudchat_left") {
    // show notification modal for 3 seconds
    const div = document.createElement("div");
    div.innerHTML = `<div class="text-center alert alert-danger alert-dismissible fade show" role="alert">
                       ${message.text}                    
                    </div>`;
    document.querySelector(".notification").appendChild(div);
    setTimeout(
      () => document.querySelector(".notification").removeChild(div),
      3000
    );
  } else {
    const div = document.createElement("div");

    // get random numbers for profile pics between 1 and 5
    const randomNum = Math.floor(Math.random() * 5) + 1;

    if (message.username === current_user.innerText) {
      div.innerHTML = `<div class="chat-message-right mb-4">
                      <div>
                          <img src="./imgs/profile${randomNum}.jpg" class="rounded-circle mr-1" alt="Chris Wood"
                              width="40" height="40">
                          <div class="text-muted small text-nowrap mt-2">${message.time}</div>
                      </div>
                      <div class="flex-shrink-1 rounded py-2 px-3 mr-3" style="background: #d6eaea;">
                          <div class="font-weight-bold mb-1">${message.username}</div>
                          ${message.text}
                      </div>
                    </div>`;
    } else {
      div.innerHTML = `<div class="chat-message-left pb-4">
                        <div>
                            <img src="./imgs/profile${randomNum}.jpg" class="rounded-circle mr-1" alt="Sharon Lessman"
                                width="40" height="40">
                            <div class="text-muted small text-nowrap mt-2">${message.time}</div>
                        </div>
                        <div class="flex-shrink-1 rounded py-2 px-3 ml-3"style="background: #eeddc4e3;
                      }">
                            <div class="font-weight-bold mb-1">${message.username}</div>
                            ${message.text}
                        </div>
                    </div>`;
    }
    document.querySelector(".chat-messages").appendChild(div);
  }
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  console.log({ users });
  userList.innerHTML = "";
  const randomNum = Math.floor(Math.random() * 5) + 1;
  current_user.innerHTML = username;

  users.forEach((user) => {
    // get random numbers for profile pics between 1 and 5

    const li = document.createElement("li");

    // check if there are no users in the room except the current user
    if (users.length === 1) {
      li.innerHTML = `<div class="alert alert-secondary text-center" role="alert">No Online Users</div>
      `;
    } // dont display the current user in the user list
    else if (user.username === username) {
      return;
    } else {
      li.innerHTML = `<a class="start_chat list-group item list-group-item-action border-0">
                      <div class="d-flex align-items-start p-2">
                          <img src="./imgs/profile${randomNum}.jpg" class="rounded-circle mx-2 border" alt="William Harris"
                              width="40" height="40">
                          <div class="flex-grow-1 ml-3">
                              ${user.username}
                              <div class="d-flex justify-content-between">
                                  <div class="small badge text-bg-success">online</div>
                              </div>
                          </div>
                      </div>
                  </a>`;
    }

    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  window.location = "../index.html";
});
