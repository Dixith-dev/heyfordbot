// embed-chatbot.js
(function() {
    // Function to load a CSS file
    function loadCSS(href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  
    // Function to load a JS file
    function loadJS(src) {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.body.appendChild(script);
    }
  
    // Function to inject the chatbot HTML
    function injectChatbot() {
      const chatbotHTML = `<!DOCTYPE html>
      <html lang="en" dir="ltr">
        <head>
          <meta charset="utf-8">
          <title>Chat AI</title>
          <link rel="stylesheet" href="static/style.css"> <!-- Include external CSS file -->
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0" />
          <script src="{{ url_for('static', filename='https://yumacollec.onrender.com/js/script.js') }}" defer></script> <!-- Include external JavaScript file -->
          <style>
      
            /* Other styles remain unchanged */
          </style>
        </head>
        <body>
          <button class="chatbot-toggler">
            <span class="material-symbols-rounded">mode_comment</span>
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="chatbot">
            <header>
              <img src="https://yumacollec.onrender.com/static/images/test.png" alt="Chatbot Icon" class="header-img" style="width: 320px; height: fit-content; margin-right: 10px; margin-left: 45px; margin-top: 20px;">
              <span class="close-btn material-symbols-outlined">close</span>
            </header>
            <ul class="chatbox">
              <li class="chat incoming">
                <!-- Replaced Material symbol span with img tag for the new chatbot icon -->
                <span class="material-symbols-outlined">smart_toy</span>
                <p>Hello, welcome to YUUMA. <br>Can I answer any questions for you ?</p>
              <!-- Additional chat messages can be added here -->
            </ul>
            <div class="chat-input">
              <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
              <button id="microphone-btn" class="material-symbols-rounded">mic</button>
              <span id="send-btn" class="material-symbols-rounded">send</span>
            </div>
          </div>
          <script src="https://yumacollec.onrender.com/static/js/script.js"></script> <!-- Include inline JavaScript -->
        </body>
      </html>`;
  
      // Append the chatbot HTML to the body of the host page
      document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
  
    // Load the chatbot assets
    loadCSS('https://yumacollec.onrender.com/static/style.css');
    loadJS('https://yumacollec.onrender.com/static/js/script.js');
  
    // Inject the chatbot HTML into the host page
    injectChatbot();
})();
