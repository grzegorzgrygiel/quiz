const number = document.querySelector("#number");
const topic = document.querySelector("#topic");
const level = document.querySelector("#level");
const type = document.querySelector("#type");
const newQuiz = document.querySelector("#newQuiz");
const nextQuestion = document.querySelector("#newQuestion");
const questionContainer = document.querySelector("#quizContainer");
const cancel = document.querySelector("#renew");

let id = 0;
let questions = [];
let answers = [];
let score = 0;

// dobrą praktyką jest stworzenie ogólnej funkcji do api
// oraz wrzucenie URL api w stałej

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
      amount: number.value,
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
  newQuiz.disabled = true;
  renew.disabled = false;
  nextQuestion.disabled = false;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.6);
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
  newQuestionTitle.classList.add("question");
  newQuestionTitle.innerHTML = `Q${id + 1}. ${questionData.question}`;
  questionContainer.append(newQuestionTitle);
  let A = questionData.correct_answer;
  let B = questionData.incorrect_answers[0];
  let C = questionData.incorrect_answers[1];
  let D = questionData.incorrect_answers[2];

  if (questionData.type === "multiple") {
    const fourAnswers = [A, B, C, D];
    const shuffledOptions = shuffle(fourAnswers);
    renderRadio("A", shuffledOptions[0]);
    renderRadio("B", shuffledOptions[1]);
    renderRadio("C", shuffledOptions[2]);
    renderRadio("D", shuffledOptions[3]);
    id++;
  } else if (questionData.type === "boolean") {
    const twoAnswers = [A, B];
    const shuffledOptions = shuffle(twoAnswers);
    renderRadio("A", shuffledOptions[0]);
    renderRadio("B", shuffledOptions[1]);
  }
}

function addAnswer(id, data) {
  const question = document.createElement("P");
  question.classList.add("question");
  const correctAnswer = document.createElement("P");
  correctAnswer.classList.add("green");
  const selectedAnswer = document.createElement("P");
  selectedAnswer.classList.add("red");
  question.innerHTML = `Q${id+1}. ${data[id].question}`;
  correctAnswer.innerHTML = `A: ${data[id].correct}`;
  selectedAnswer.innerHTML = `A: ${data[id].selected}`;
  let corAns = data[id].correct;
  let selAns = data[id].selected;
  if (selAns === corAns) {
    questionContainer.append(question);
    questionContainer.append(correctAnswer);
  } else {
    questionContainer.append(question);
    questionContainer.append(correctAnswer);
    questionContainer.append(selectedAnswer);
  }
}

function recordItem(id, question, correct, selected) {
  this.id = id;
  this.question = question;
  this.correct = correct;
  this.selected = selected;
}

function recordAnswer() {
  let question = questions[id - 1].question;
  let correctAnswer = questions[id - 1].correct_answer;
  let answerSelected = "";
  let answerRadio = document.querySelector("input[name=question]:checked");

  answerSelected = answerRadio.value;
  if (answerSelected === correctAnswer) {
    score++;
  }
  answers.push(new recordItem(id, question, correctAnswer, answerSelected));
  console.log(`question #${id}`);
  console.log(`The correct answer is: ${correctAnswer}`);
  console.log(`You selected: ${answerSelected}`);
  console.log(`Your score is: ${score}`);
  console.log(answers);
}


function removeItem() {
  while (questionContainer.firstChild) {
    questionContainer.removeChild(questionContainer.firstChild);
  }
}

function resetQuiz() {
  removeItem();
  id = 0;
  answers = [];
  questions = [];
  score = 0;
  newQuiz.disabled = false;
  renew.disabled = true;
  nextQuestion.disabled = true;
  console.clear();
}

function addQuestion() {
  if (id < questions.length) {
    recordAnswer();
    removeItem();
    addNewQuestion(id, questions[id]);
    id++;
  } else if (id === questions.length) {
    recordAnswer();
    removeItem();
    const quizScore = document.createElement("P");
    quizScore.innerHTML = `Your score is ${score} out of ${id}`;
    questionContainer.append(quizScore);
    for (let i = 0; i <= questions.length; i++) {
      addAnswer(i, answers);
    }
  }
}

newQuiz.addEventListener("click", saveQuestions);
nextQuestion.addEventListener("click", addQuestion);
renew.addEventListener("click", resetQuiz);