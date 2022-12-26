const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const current_user = document.getElementById("current_user");
const connectPort = document.getElementById("connect_port");
const chatRooms = document.getElementById("chatrooms_");
const addRoom = document.getElementById("addRoom");
const addchatroommessage = document.querySelector(".add_room_message");

// Get username and room from URL
const { username, room, image } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// ***************************************************** //
// *******************  CHAT MESSAGES  ***************** //
// ***************************************************** //
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
  socket.emit("chatMessage", { msg, image });

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// chat history from server
socket.on("chatHistory", (history) => {
  outputHistoryMessages(history);
});

// ***************************************************** //
// *******************  FUNCTIONS  ********************* //
// ***************************************************** //
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

    if (message.username === current_user.innerText) {
      div.innerHTML = `<div class="chat-message-right mb-4">
                      <div>
                          <img src="./imgs/${message.image}" class="rounded-circle mr-1" alt="Chris Wood"
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
                            <img src="./imgs/${message.image}" class="rounded-circle mr-1" alt="Sharon Lessman"
                                width="40" height="40">
                            <div class="text-muted small text-nowrap mt-2">${message.time}</div>
                        </div>
                        <div class="flex-shrink-1 rounded py-2 px-3 ml-3"style="background: #eeddc4e3;">
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
  // console.log({ users });
  userList.innerHTML = "";
  current_user.innerHTML = username;

  users.forEach((user) => {
    const li = document.createElement("li");

    // check if there are no users in the room except the current user
    if (users.length === 1) {
      li.innerHTML = `<div class="alert alert-secondary text-center" role="alert">No Online Users</div>
      `;
    } // dont display the current user in the user list
    else if (user.username === username) {
      return;
    } else {
      // display profile image of current user else display default image
      li.innerHTML = `<a class="active_users start_chat list-group item list-group-item-action border-0">
                      <div class="d-flex align-items-start p-2">
                          <div class="flex-grow-1 ml-3 name">
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

// display history messages to DOM
function outputHistoryMessages(history) {
  history.forEach((data) => {
    const div = document.createElement("div");

    // check if history is for current chat room
    if (data.chat_room === room) {
      //  get actual time in 12 hour format with AM/PM
      let time_in_Hours = new Date(data.time_stamp).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      // check if message is from current user
      if (data.user_id === current_user.innerText) {
        div.innerHTML = `<div class="chat-message-right mb-4">
                        <div>
                            <img src="./imgs/${data.images}" class="rounded-circle mr-1" alt="Chris Wood"
                                width="40" height="40">
                            <div class="text-muted small text-nowrap mt-2">${time_in_Hours}</div>
                        </div>
                        <div class="flex-shrink-1 rounded py-2 px-3 mr-3" style="background: #d6eaea;">
                            <div class="font-weight-bold mb-1">${data.user_id}</div>
                            ${data.message}
                        </div>
                      </div>`;
      } else {
        div.innerHTML = `<div class="chat-message-left pb-4">
                        <div>
                            <img src="./imgs/${data.images}" class="rounded-circle mr-1" alt="Sharon Lessman"
                                width="40" height="40">
                            <div class="text-muted small text-nowrap mt-2">${time_in_Hours}</div>
                        </div>
                        <div class="flex-shrink-1 rounded py-2 px-3 ml-3"style="background: #eeddc4e3;">                      
                            <div class="font-weight-bold mb-1">${data.user_id}</div>
                            ${data.message}
                        </div>
                    </div>`;
      }
    } else {
      div.innerHTML = `<div class="text-center alert alert-info alert-dismissible fade show" role="alert">
                        ${data.message}
                      </div>`;
    }

    document.querySelector(".chat-messages").appendChild(div);
  });
}

// display image in profile
document.getElementById("profile_image_user").src = "./imgs/" + image;
