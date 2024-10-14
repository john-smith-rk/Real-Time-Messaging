const socket = io();
document.cookie = "my_cookie=value; SameSite=None; Secure";
const inputField = document.querySelector(".message_form__input");
const messageBox = document.querySelector(".inbox__messages");
const missagehistory = document.querySelector(".messages__history");
const inboxPeople = document.querySelector(".inbox__people");
const messageForm = document.querySelector(".message_form");
const fallBack  = document.querySelector(".fallback");

let userName = "";

const newUserConnected = (user)=>{

    userName = user || `User${Math.floor(Math.random() * 1000000)}`;

    console.log(userName);

    socket.emit("new user", userName);
    addToUserBox(userName);
};


const addToUserBox = (name)=>{
    if (!!document.querySelector(`.${name}-userlist`)) {
        return;
      }
    
      const userBox = `
        <div class="chat_ib ${name}-userlist">
          <h5>${name}</h5>
        </div>
      `;
      inboxPeople.innerHTML += name != userName ?userBox:'';
};



// new user is created so we generate nickname and emit event
newUserConnected();

socket.on("new user", (data)=>{
  console.log("From Client Side");
   data.map((user)=>addToUserBox(user));
});

socket.on('user disconnected', (user)=>{
 document.querySelector(`.${user}-userlist`).remove();
});


messageForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  if (!inputField.value) {
    return;
  }

  socket.emit("typing", {
    isTyping: false,
    nick: userName,
    message: inputField.value
  });

  socket.emit("chat message", {
    message : inputField.value,
    nick: userName
  });

  inputField.value = "";

});


/////

socket.on("chat message", function(data){
   addNewMessage({user : data.nick, message :data.message})
});

///////////

const addNewMessage = ({user, message})=>{
   const time = new Date();
   const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

   const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;

};

///////////////

inputField.addEventListener("keyup", (e)=>{
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    nick: userName,
    message:'Typing...'+inputField.value
  });
});

inputField.addEventListener("blur", () => {
  socket.emit("typing", {
    isTyping: false,
    nick: userName,
    message: inputField.value
  });
});

////////////
socket.on("typing", (data)=>{
   const {isTyping, nick} = data;

   if(!isTyping){
    fallBack.innerHTML = "";
    return;
   }

   fallBack.innerHTML = `<p>${nick} is typing...</p>`;
});