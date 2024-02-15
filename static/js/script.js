const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const microphoneBtn = document.getElementById('microphone-btn');

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

// Function to get or create a unique user ID
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, (match) => {
        // Check if the URL is an image link
        if (match.match(/\.(jpeg|jpg|gif|png)$/) != null) {
            return `<img src="${match}" alt="Image" style="max-width:100%;height:auto;">`;
        } else {
            return `<a href="${match}" target="_blank">here</a>`;
        }
    });

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,5})/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? 
        `<p>${message}</p>` : 
        `<span class="material-symbols-outlined">smart_toy</span><p>${linkify(message)}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

const generateResponse = (chatElement, typingInterval) => {
    const SERVER_URL = "https://heyfordbot1.onrender.com//get-response";
    const userId = getUserId();

    fetch(SERVER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            message: userMessage,
            user_id: userId
        })
    })
    .then(res => res.json())
    .then(data => {
        clearInterval(typingInterval); // Make sure to clear the typing animation
        const incomingChatLi = createChatLi(data.response, "incoming"); // Create a new chat bubble for the response
        chatbox.replaceChild(incomingChatLi, chatElement); // Replace the "Typing..." bubble with the response bubble
        chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to the new message
    })
    .catch((error) => {
        clearInterval(typingInterval); // Also clear the typing animation in case of error
        console.error('Error:', error);
        chatElement.querySelector("p").textContent = "Oops! Something went wrong. Please try again.";
    });
}


const handleSend = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    const outgoingChatLi = createChatLi(userMessage, "outgoing");
    chatbox.appendChild(outgoingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    setTimeout(() => {
        const incomingChatLi = createChatLi("Typing.", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        let dotCount = 1;
        const typingInterval = setInterval(() => {
            incomingChatLi.innerHTML = `<span class="material-symbols-outlined">smart_toy</span><p>Typing${'.'.repeat(dotCount)}</p>`;
            dotCount = (dotCount % 6) + 1; // Cycle dotCount from 1 to 6
        }, 500);

        generateResponse(incomingChatLi, typingInterval); // Pass the typingInterval to the generateResponse function
    }, 600);
};

function updateTypingMessage(message) {
    const typingElements = document.getElementsByClassName('typing');
    if(typingElements.length > 0) {
        // Assuming there's only one typing element at a time
        typingElements[0].innerText = message;
    } else {
        // Create new typing element if it doesn't exist
        const incomingChatLi = createChatLi(message, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent the default action to avoid a newline
        handleSend(); // Call the send handler
    }
});

sendChatBtn.addEventListener("click", handleSend);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));


// Enhanced Speech Recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isSpeechDetected = false;
let recognitionTimeout;

function updateMicrophoneIcon(isListening) {
    if (isListening) {
        microphoneBtn.classList.add('listening');
    } else {
        microphoneBtn.classList.remove('listening');
    }
}

recognition.onstart = function() {
    console.log('Voice recognition activated. Start speaking.');
    updateMicrophoneIcon(true);
    clearTimeout(recognitionTimeout);
    isSpeechDetected = false;
};

recognition.onspeechend = function() {
    setTimeout(() => {
        recognition.stop();
        if (!isSpeechDetected) {
            chatbox.appendChild(createChatLi("No speech detected. Please try again.", "incoming"));
        }
    }, 2000 + Math.random() * 2000); // Random delay between 2 to 4 seconds
};

recognition.onresult = function(event) {
    isSpeechDetected = true;
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript;
    updateMicrophoneIcon(false);
    handleChat();
};

recognition.onerror = function(event) {
    console.error('Speech recognition error detected: ' + event.error);
    updateMicrophoneIcon(false);
    chatbox.appendChild(createChatLi(`Error in speech recognition: ${event.error}`, "incoming"));
};

microphoneBtn.addEventListener('click', function() {
    if (microphoneBtn.classList.contains('listening')) {
        recognition.stop();
    } else {
        recognition.start();
        recognitionTimeout = setTimeout(() => {
            if (!isSpeechDetected) {
                recognition.stop();
                updateMicrophoneIcon(false);
                chatbox.appendChild(createChatLi("No speech detected. Please try again.", "incoming"));
            }
        }, 12000); // Adjusted total time to 12 seconds (10 seconds listening + up to 2 seconds delay)
    }
});
