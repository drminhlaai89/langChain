// Existing code to toggle the chatbox
const chatboxButton = document.querySelector('.chatbox-button');
const expandedChatbox = document.querySelector('.chatbox-expanded');
const closeButton = document.getElementById('close-button');
var dropdownContent = document.getElementById('dropdown-content');
let currentLanguage = 'en';
let isAnimationPlaying = false;

let languageChoice = 'en-US';

let isChatboxExpanded = false;

chatboxButton.addEventListener('click', () => {
    if (isChatboxExpanded) {
        // Collapse the chatbox
        expandedChatbox.style.display = 'none';
        chatboxButton.style.display = 'flex';
    } else {
        // Expand the chatbox
        expandedChatbox.style.display = 'block';
    }
    isChatboxExpanded = !isChatboxExpanded;
});

function init() {
     // Initialize the SpeechRecognition API
     var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageChoice;
    let isRecording = false;
    let ongoingSpeechText = '';

    
     // Toggle recording state when the record button is clicked
    document.getElementById('record-button').addEventListener('click', function() {
      if (!isRecording) {
          recognition.start();
          isRecording = true;
          document.getElementById('record-button').classList.add('active');
          console.log(isRecording);
      } else {
          recognition.stop();
          isRecording = false;
          document.getElementById('record-button').classList.remove('active');
      }
  });

     // Process the recognized speech
    recognition.onresult = function(event) {
      const lastResultIndex = event.results.length - 1;
      const recognizedText = event.results[lastResultIndex][0].transcript;
      ongoingSpeechText = recognizedText;
      document.getElementById('user-input').value = ongoingSpeechText;
      if (isRecording && event.results[0].isFinal) {
        recognition.abort();
        isRecording = false;
        document.getElementById('record-button').classList.remove('active');
        ongoingSpeechText = '';
      }
      console.log(recognizedText);
    };
    recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    };
}

function changeLanguage(language) {
    currentLanguage = language;
    var dropdownLabel = document.getElementById('dropbtn-label');
    dropdownLabel.textContent = getLanguageName(language);
    clearChat();
    const dropdownContent = document.getElementById('dropdown-content');
    const dropdownButton = document.querySelector('.dropdown .dropbtn');
    dropdownContent.style.display = 'none';
    init();
    recognition.lang = languageChoice;
    console.log(recognition.lang );

    fetch('/change_language', {
        method: 'POST',
        body: new URLSearchParams({ 'language': language }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(response => response.json())
      .then(data => {
        console.log('Language changed:', language);
      })
      .catch(error => console.error('Error:', error));
  }

  function clearChat() {
    var messageContainer = document.getElementById('chat-display');
    while (messageContainer.firstChild) {
      messageContainer.firstChild.remove();
    }
  }

function getLanguageName(language) {
    if (language === 'en') {
      languageChoice = 'en-US';
      return 'EN';
    } else if (language === 'fr') {
      languageChoice = 'fr-FR';
      return 'FR';
    }
    // Add more language codes and names as needed
  }

  function toggleDropdown() {
    dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
  }


  document.addEventListener('click', function (event) {
    var dropdownButton = document.getElementById('dropdown-button');
    var dropdownContent = document.getElementById('dropdown-content');
  
    var isClickInsideButton = dropdownButton.contains(event.target);
    var isClickInsideDropdown = dropdownContent.contains(event.target);
  
    if (!isClickInsideButton && !isClickInsideDropdown) {
      // Nếu không click vào nút button hoặc nội dung drop-down, ẩn drop-down
      dropdownContent.style.display = 'none';
    }
  });
  