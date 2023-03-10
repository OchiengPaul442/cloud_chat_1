const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const current_user = document.getElementById("current_user");
const connectPort = document.getElementById("connect_port");
const chatRooms = document.getElementById("chatrooms_");
const addRoom = document.getElementById("addRoom");
const addchatroommessage = document.querySelector(".add_room_message");
const serverChatRoomForm = document.getElementById("serverChatRoomForm");
const editProfileForm = document.getElementById("editProfileForm");
const editPasswordForm = document.getElementById("editPasswordForm");

// Get username and room from URL
const { username, room, image } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users, data }) => {
  outputRoomName(room);
  outputUsers(users, data);
});

// ***************************************************** //
// *******************  edit profile   ***************** //
// ***************************************************** //
editProfileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get username and email
  let username = e.target.elements.username_edit.value;
  let email = e.target.elements.email_edit.value;

  username = username.trim();
  email = email.trim();

  if (!username || !email) {
    return false;
  }

  // Emit username and email to server
  socket.emit("editProfile", { username, email });
});

editPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get password and confirm password
  let old_password = e.target.elements.old_pwd_edit.value;
  let new_password = e.target.elements.new_pwd_edit.value;

  old_password = old_password.trim();
  new_password = new_password.trim();

  if (!old_password || !new_password) {
    return false;
  }

  // Emit password and confirm password to server
  socket.emit("editPassword", { old_password, new_password });

  // Clear input
  e.target.elements.old_pwd_edit.value = "";
  e.target.elements.new_pwd_edit.value = "";
  e.target.elements.old_pwd_edit.focus();
});

// show notification when user successfully or unsuccessfully edits password
socket.on("passwordError", (message) => {
  // show message
  if (message.username === "Success") {
    document.querySelector(".notification_on_pwd").innerHTML =
      `<div class="text-center alert alert-success alert-dismissible fade show" role="alert">` +
      message.text +
      `</div>`;
  } else {
    document.querySelector(".notification_on_pwd").innerHTML =
      `<div class="text-center alert alert-danger alert-dismissible fade show" role="alert">` +
      message.text +
      `</div>`;
  }
  // hide message
  setTimeout(() => {
    $(".notification_on_pwd").slideUp(200);
  }, 3000);
});

// display profile details
socket.on("profileDetails", (details) => {
  // display profile details
  details.forEach((detail) => {
    document.getElementById("username_edit").value = detail.user_name;
    document.getElementById("email_edit").value = detail.user_email;
  });
});

// redirect to chatroom
socket.on("redirect", (url) => {
  window.location = url;
});

$("#editProfileLabel").text("Edit Profile Form");

$("#password_change").on("click", () => {
  $("#editProfileForm").hide(200);
  $("#editPasswordForm").show(200);
  $("#editProfileLabel").text("Change Password Form");
});

$("#back_to_btn").on("click", () => {
  $("#editProfileForm").show(200);
  $("#editPasswordForm").hide(200);
  $("#editProfileLabel").text("Edit Profile Form");
});

// ***************************************************** //
// *******************  Remote server  ***************** //
// ***************************************************** //
// connect to remote server
connectPort.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get port number
  let port = e.target.elements.port.value;

  port = port.trim();

  if (!port) {
    return false;
  }

  // Emit port number to server
  socket.emit("connectPort", port);

  // Clear input
  e.target.elements.port.value = "";
  e.target.elements.port.focus();
});

// show serverchatroom modal when user successfully enters port number
socket.on("success", (details) => {
  // hide modal
  // show for that particular user
  $("#connect_to_server").modal("hide");
  // show modal
  $("#serverchatroom").modal("show");
});

// display notification when user successfully or unsuccessfully connects to remote server
socket.on("serverprocess", (message) => {
  // show message
  setInterval(() => {
    if (message.username === "SUCCESS") {
      document.querySelector(".loading_icon").style.display = "none";
      document.querySelector(".CONN_NOTIF").innerHTML =
        `<div class="text-center alert alert-success alert-dismissible fade show" role="alert">` +
        message.text +
        `</div>`;
    } else {
      document.querySelector(".loading_icon").style.display = "none";
      document.querySelector(".CONN_NOTIF").innerHTML =
        `<div class="text-center alert alert-danger alert-dismissible fade show" role="alert">` +
        message.text +
        `</div>`;
    }
  }, 1000);
});

// submit message to remote server
serverChatRoomForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.server_msg_server1.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("serverChatMessage", msg);

  // Clear input
  e.target.elements.server_msg_server1.value = "";
  e.target.elements.server_msg_server1.focus();
});

// Message from server
socket.on("serverMessages", (message) => {
  outputServerMessage(message);
});

// ***************************************************** //
// *******************  CHAT MESSAGES  ***************** //
// ***************************************************** //
// Message submit to server
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
socket.on("messages", (message) => {
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// chat history from server
socket.on("chatHistory", (history) => {
  outputHistoryMessages(history);
  // scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
function outputUsers(users, data) {
  userList.innerHTML = "";
  current_user.innerHTML = username;

  data.forEach((pic) => {
    users.forEach((user) => {
      const li = document.createElement("li");
      if (pic.user_name === user.username) {
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
                          <img src="./imgs/${
                            pic.profile_img ? pic.profile_img : "default.jpg"
                          }" alt="user" style="margin:0 10px;" class="rounded-circle user_img" height="40" width="40">
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
      }
    });
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
      if (data.user_id === username) {
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

// display server messages to DOM
function outputServerMessage(message) {
  const div = document.createElement("div");
  if (message.username === "Server1") {
    div.innerHTML = `<div class="text-success">
                      CLOUDCHAT: ${message.text}
                    </div>`;
  } else {
    div.innerHTML = `<div class="text-danger">
                      SERVER2: ${message.text}
                    </div>`;
  }
  document.querySelector(".server_messages").appendChild(div);
}

// display image in profile
document.getElementById("profile_image_user").src = "./imgs/" + image;
