const number = document.querySelector("#number");
const topic = document.querySelector("#topic");
const level = document.querySelector("#level");
const type = document.querySelector("#type");
const newQuiz = document.querySelector("#newQuiz");
const nextQuestion = document.querySelector("#newQuestion");
const questionContainer = document.querySelector("#quizQuestion");

let id = 0;

// dobrą praktyką jest stworzenie ogólnej funkcji do api
// oraz wrzucenie URL api w stałej
// tworzenie prostych funkcji pomaga w opanowaniu skomplikowanego kodu i naprawę bugów w jednym miejscu

let questions = [];
let answers = {};
let score = 0;

const API_URL = "https://opentdb.com/api.php?";

async function getData(url, params) {
  const res = await axios.get(url, {
    params,
  });
  return res;
}

async function getQuestions() {
  try {
    const params = {
      amount: 10,
      category: topic.value,
      difficulty: level.value,
      type: type.value,
    };
    const res = await getData(API_URL, params);
    return res.data.results;
  } catch (e) {
    return "NO QUESTIONS AVAILABLE! SORRY :(";
  }
}

async function saveQuestions() {
  questions = await getQuestions();
  addNewQuestion(id, questions[id]);
  id++;
}

function renderRadio(id, answer) {
  let radiobox = document.createElement("input");
  radiobox.classList.add("answerOption");
  radiobox.type = "radio";
  radiobox.name = "question";
  radiobox.id = id;
  radiobox.value = answer;

  let label = document.createElement("label");
  label.htmlFor = id;

  label.innerHTML = `${answer}`; // innerHTML tworzy html wewnątrz elementu

  let newline = document.createElement("br");

  questionContainer.appendChild(radiobox);
  questionContainer.appendChild(label);
  questionContainer.appendChild(newline);
}

function addNewQuestion(id, questionData) {
  const newQuestionTitle = document.createElement("P");
  //newQuestionTitle.append(`Q${id + 1}. `); // nie wyświetlają się numery pytań, nadpisuje title
  newQuestionTitle.innerHTML = `Q${id + 1}. ${questionData.question}`; // innerHTML tworzy html wewnątrz elementu
  questionContainer.append(newQuestionTitle);
  if (questionData.type === "multiple") {
    renderRadio("A", questionData.correct_answer);
    renderRadio("B", questionData.incorrect_answers[0]);
    renderRadio("C", questionData.incorrect_answers[1]);
    renderRadio("D", questionData.incorrect_answers[2]);
    id++;
  } else if (questionData.type === "boolean") {
    renderRadio("T", questionData.correct_answer);
    renderRadio("F", questionData.incorrect_answers[0]);
  }
}
// w twojej funkcji też nie wyświetlają się numery pytań

// async function addQuestionSet() {
//     await saveQuestions();
//     questions.forEach((question) => {
//         addNewQuestion(id, question);
//         id++;
//     });
// }

function recordAnswer() {
  let correctAnswer = questions[id - 1].correct_answer;
  let answerSelected = "";
  let options = document.querySelectorAll(".answerOption");
  answerSelected = Array.from(options).find((radio) => radio.checked).value;
  if (correctAnswer === answerSelected) {
    score++;
  }
  // sprawdzenie że działa, ale docelowo chciałbym zapisać odpowiedzi w answers
  // ale na razie nie mam pomysłu
  console.log(`question #${id}`);
  console.log(correctAnswer);
  console.log(answerSelected);
  console.log(`the score is: ${score}`);
}

function removeItem() {
  let node = document.querySelector("#quizQuestion");
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function addQuestion() {
  recordAnswer();
  removeItem();
  addNewQuestion(id, questions[id]);
  id++;
  // opcja kiedy się skończy lista
}

// newQuiz.addEventListener("click", addQuestionSet);
newQuiz.addEventListener("click", saveQuestions);
nextQuestion.addEventListener("click", addQuestion);
