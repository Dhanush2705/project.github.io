const inputBox = document.getElementById("user-input");
const chatContainer = document.getElementById("chatbox");
const timestamp = getCurrentTime();

// Send message to backend
function sendMessage() {
    const userInput = inputBox.value.trim();
    if (!userInput) return;

    appendMessage("user", userInput, getCurrentTime());
    inputBox.value = "";

    const typing = showBotTyping();

    fetch(`https://chatbot-backend-co0s.onrender.com/get?msg=${encodeURIComponent(userInput)}`)

        .then(response => response.json())
        .then(data => {
            chatContainer.removeChild(typing);

            let reply = data.reply;

            // 🧠 Check if reply is an object
            if (typeof reply === "object") {
                let formatted = "";
                for (let key in reply) {
                    formatted += `• ${key}: ${reply[key]}\n`;
                }
                reply = `<pre>${formatted.trim()}</pre>`;  // Use <pre> for neat formatting
            }

            appendMessage("bot", reply, getCurrentTime());
        })
        .catch(error => {
            chatContainer.removeChild(typing);
            appendMessage("bot", "Oops! Something went wrong.", getCurrentTime());
            console.error("Error:", error);
        });
}

// Append message to chat UI
function appendMessage(sender, message, time) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-msg" : "bot-msg");

    msgDiv.innerHTML = `
        <div class="msg-content">
            ${message}
            <span class="timestamp">${time}</span>
        </div>
    `;

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show "Bot is typing..." message
function showBotTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-msg typing";
    typingDiv.innerHTML = `
        <div class="msg-content">Bot is typing<span class="dots">...</span></div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingDiv;
}

// Get time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Toggle mic and send button
function toggleIcons() {
    const input = inputBox.value.trim();
    document.getElementById('mic-button').style.display = input ? 'none' : 'inline';
    document.getElementById('send-button').style.display = input ? 'inline' : 'none';
}

// Handle Enter key to send
inputBox.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// Voice input with Web Speech API
function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        inputBox.value = transcript;
        sendMessage();
    };

    recognition.onerror = function (event) {
        alert("Voice input error: " + event.error);
    };

    recognition.start();
}
