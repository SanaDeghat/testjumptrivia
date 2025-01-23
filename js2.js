// JavaScript for the enhanced game functionality
const CATEGORY_API_URL = "https://opentdb.com/api_category.php";
const TRIVIA_API_BASE_URL = "https://opentdb.com/api.php";
const PEXELS_API_URL = "https://api.pexels.com/v1/search";
const PEXELS_API_KEY = "PFvrJcB1kFNPv2joOp3WZeLwACHBhlhRNq0aqubxgGk7mQpXiSJG8wMs"; // Replace with your Pexels API key

let questions = [];
let currentQuestionIndex = 0;
let isJumping = false;
let isGameOver = false;
let score = 0;
// Define cache names
const CACHE_NAME = 'my-app-cache-v1';
const DYNAMIC_CACHE_NAME = 'my-app-dynamic-cache-v1';

// Files to cache during install
const STATIC_ASSETS = [
  '/', 
  '/index.html',
  '/styles.css',
  '/app.js',
  '/favicon.ico',
  // Add other static files you want to cache
];

// Install event: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network fetch is successful, cache the response
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If network fetch fails, fallback to cache
        return caches.match(event.request);
      })
  );
});
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const startScreen = document.getElementById("start-screen");
    const dino = document.getElementById("dino");
    const Body = document.getElementById("body");
    const obstacle = document.getElementById("obstacle");
    const gameOverScreen = document.getElementById("gameOver");
    const questionContainer = document.getElementById("question");
    const answersContainer = document.getElementById("answers");
   // const scoreDisplay = document.createElement("div");
    
// load the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      }, function(error) {
        console.log('Service Worker registration failed:', error);
      });
    });
  }                    
                      
   // scoreDisplay.id = "score-display";
  //  scoreDisplay.textContent = `Score: ${score}`;
   // Body.appendChild(scoreDisplay);

    // Populate categories
    function populateCategories() {
        const categorySelect = document.getElementById("category");
        categorySelect.innerHTML = "";
    
        const triviaCategories = [
            { id: 9, name: "General Knowledge" },
            { id: 10, name: "Books" },
            { id: 11, name: "Film" },
            { id: 12, name: "Music" },
            { id: 13, name: "Musicals & Theatres" },
            { id: 14, name: "Television" },
            { id: 15, name: "Video Games" },
            { id: 16, name: "Board Games" },
            { id: 17, name: "Science & Nature" },
            { id: 18, name: "Science: Computers" },
            { id: 19, name: "Science: Mathematics" },
            { id: 20, name: "Mythology" },
            { id: 21, name: "Sports" },
            { id: 22, name: "Geography" },
            { id: 23, name: "History" },
            { id: 24, name: "Politics" },
            { id: 25, name: "Art" },
            { id: 26, name: "Celebrities" },
            { id: 27, name: "Animals" },
            { id: 28, name: "Vehicles" },
            { id: 29, name: " Comics" },
            { id: 30, name: "Science: Gadgets" },
            { id: 31, name: " Japanese Anime & Manga" },
            { id: 32, name: " Cartoon & Animations" }
        ];
    
        triviaCategories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    

    // Start Game
    document.getElementById("start-button").onclick = () => {
    
        // Hide start screen and show game container
        const category = document.getElementById("category").value;

    document.getElementById("start-screen").hidden = true;
    document.getElementById("screen-remover").innerHTML="";
    document.getElementById("game-screen").hidden = false;
        
    
    
        // Fetch questions and start the game
        fetchQuestions(category).then(() => {
            startObstacleAnimation();
        });
    };
    

    // Fetch Trivia Questions
    function fetchQuestions(category) {
        console.log("Hello world!");
        const triviaUrl = `${TRIVIA_API_BASE_URL}?amount=10&category=${category}`;
        return fetch(triviaUrl)
            .then((response) => response.json())
            .then((data) => {
                questions = data.results;
                currentQuestionIndex = 0;
                showQuestion();
            })
            .catch((error) => console.error("Error fetching trivia questions:", error));
    }

    // Fetch Hint Image
// Fetch an image
function fetchImage(keyword) {
    fetch(`https://api.pexels.com/v1/search?query=${keyword}&per_page=1`, {
        headers: { Authorization: PEXELS_API_KEY }
    })
        .then(response => response.json())
        .then(data => {
            const imageElement = document.getElementById("image");
            const photo = data.photos[0];

            if (photo) {
                imageElement.src = photo.src.medium;

                imageElement.hidden = false;
            } else {
                imageElement.hidden = true;
            }
        })
        .catch(error => {
            console.error("Error fetching image:", error);
            document.getElementById("image").hidden = true;
        });
}
// Show Question
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }


    const currentQuestion = questions[currentQuestionIndex];
    questionContainer.textContent = currentQuestion.question;
    fetchImage(currentQuestion.correct_answer);

    answersContainer.innerHTML = "";
    const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    answers.sort(() => Math.random() - 0.5);

    answers.forEach((answer) => {
        const button = document.createElement("button");
        button.textContent = answer;

        // Handle button click
        button.onclick = () => {
            if (answer === currentQuestion.correct_answer) {
                dinoJump(); // Jump only on the correct answer
                
            } else {
                // Show feedback for incorrect answers (optional)
                console.log("Incorrect answer");
            }
            currentQuestionIndex++; // Move to the next question
                showQuestion();
        };

        answersContainer.appendChild(button);
    });
}

// Listen for space bar press to trigger jump
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isJumping && !isGameOver) {
        dinoJump(); // Trigger jump on space bar
    }
});


    // Dino Jump
    function dinoJump() {
        if (isJumping || isGameOver) return;

        isJumping = true;
        dino.classList.add("jump");

        setTimeout(() => {
            dino.classList.remove("jump");
            isJumping = false;
        },1000); // Longer jump
    }

    // End Game
    function endGame() {
        console.log('U lost L loser roger doss would never');
        isGameOver = true;
        gameOverScreen.hidden = false;
        obstacle.style.animationPlayState = "paused";
        document.querySelector(".ground").style.animationPlayState = "paused";
        gameOverScreen.innerHTML = `
            <p>Game Over!</p>
            <p>Your Score: ${score}</p>
            <button id="restart-button">Restart</button>
        `;

        document.getElementById("restart-button").onclick = () => {
            location.reload();
        };
    }

    // Start obstacle animation
    function startObstacleAnimation() {
        obstacle.style.animation = "moveObstacle 4s linear infinite"; // Slower obstacle
    }

    // Check Collision
    function checkCollision() {
        const dinoRect = dino.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            dinoRect.x < obstacleRect.x + obstacleRect.width &&
            dinoRect.x + dinoRect.width > obstacleRect.x &&
            dinoRect.y < obstacleRect.y + obstacleRect.height &&
            dinoRect.height + dinoRect.y > obstacleRect.y
        ) {
            endGame();
        }
    }

    // Collision Checker Loop
    setInterval(() => {
        if (!isGameOver) checkCollision();
    }, 10);

    // Initialize
    populateCategories();
});
// handle install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});                    
                    