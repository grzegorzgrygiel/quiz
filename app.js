const settingsDiv = document.querySelector("#settings");
const showScore = document.querySelector("#score");

let id = 0;
let questions = [];
let answers = [];
let tokenObject = {
  data: {
    response_code: '',
    token: '',
  },
};
let score = 0;
let code = '';

newQuestion.disabled = true;
reset.disabled = true;
showScore.disabled = true;

const API_URL = "https://opentdb.com/api.php?";
const API_token = 'https://opentdb.com/api_token.php?command=request'

async function getToken(url) {
  tokenObject = await axios.get(url);
  return tokenObject;
}

async function getData(url, params) {
  const res = await axios.get(url, {
    params,
  });
  return res;
}

// %%%%%%%%% GET QUESTIONS FROM API %%%%%%%%%%%%%

async function generateToken() {
  tokenObject = await getToken(API_token);
  console.log(`Your token is: ${tokenObject.data.token}`);
  codeMSG.style.display = 'inline';
  codeMSG.innerHTML = '<span class="red">Your token has been generated!</span>';
}

async function getQuestions() {
  try {
    const params = {
      token: tokenObject.data.token,
      amount: number.value,
      category: topic.value,
      difficulty: level.value,
      type: type.value,
    };
    const res = await getData(API_URL, params);
    return res.data;
  } catch (e) {
    return "NO QUESTIONS AVAILABLE! SORRY :(";
  }
}


// %%%%%%%%%% DISPLAY 1ST QUESTION %%%%%%%%%%%%%%

// function for the START QUIZ button

async function saveQuestions() {
  let data = await getQuestions();
  questions = data.results;
  code = data.response_code;
  if (data.response_code === 1) {
    console.log("The API doesn't have enough questions for your query");
    codeMSG.style.display = 'inline';
    codeMSG.innerHTML = '<span class="red">You need to select fewer questions!</span>';
  } else if (data.response_code === 4) {
    console.log("Session Token has returned all possible questions for the specified query.");
    codeMSG.style.display = 'inline';
    codeMSG.innerHTML = '<span class="red">There aren\'t enough questions for these settings!</span>';
  } else if (data.response_code === 0) {
    codeMSG.style.display = 'none';
    addNewQuestion(id, questions[id]);
    id++;
    newQuiz.disabled = true;
    reset.disabled = false;
    newQuestion.disabled = false;
    token.disabled = true;
    settingsDiv.style.display = 'none'
  }
}

// %%%%%%%% FORMAT RADIO ANSWERS %%%%%%%%%%%%%%

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

  quizContainer.appendChild(radiobox);
  quizContainer.appendChild(label);
  quizContainer.appendChild(newline);
}

// %%%%%%%%%%% DISPLAY QUESTION & ANSWERS %%%%%%%%

function shuffle(array) {
  return array.sort(() => Math.random() - 0.6);
}

function addNewQuestion(id, questionData) {
  info.style.display = 'none';
  const newQuestionTitle = document.createElement("P");
  newQuestionTitle.classList.add("question");
  newQuestionTitle.innerHTML = `Q${id + 1}. ${questionData.question}`;
  quizContainer.append(newQuestionTitle);
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
//  function for the NEXT button

function addQuestion() {
  try {
    info.style.display = 'none';
    if (id < questions.length) {
      recordAnswer();
      removeItem();
      addNewQuestion(id, questions[id]);
      id++;
      showScore.disabled = false;
    } else if (id === questions.length) {
      // option for the last question:
      recordAnswer();
      removeItem();
      const quizEnd1 = document.createElement("P");
      quizEnd1.style.textAlign = 'center';
      quizEnd1.innerHTML = "<b>This is the end of the quiz.</b>";
      quizContainer.append(quizEnd1);
      const quizEnd2 = document.createElement("P");
      quizEnd2.style.textAlign = 'center';
      quizEnd2.innerHTML = "<b>Click SCORE to see how well you've done.</b>";
      quizContainer.append(quizEnd2);
      showScore.disabled = false;
      newQuestion.disabled = true;
      token.disabled = true;
    }
  } catch (error) {
    console.error('No answer has been selected');
    info.style.display = 'inline';
    info.innerHTML = '<span class="red">You need to select and answer!</span>';
  }
}


// %%%%%%%%%% KEEP SCORE & RECORD ANSWERS %%%%%%%%%%%%%

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
}

// %%%%%%%%%%%%%%%%% RESET & REMOVE DISPLAYED QUESTIONS %%%%%%%%%%%%%%%%%%%%%

function removeItem() {
  while (quizContainer.firstChild) {
    quizContainer.removeChild(quizContainer.firstChild);
  }
}

//  function for the RESET and RESTART button

function resetQuiz() {
  removeItem();
  id = 0;
  answers = [];
  questions = [];
  score = 0;
  newQuiz.disabled = false;
  reset.disabled = true;
  newQuestion.disabled = true;
  showScore.disabled = true;
  token.disabled = false;
  settingsDiv.style.display = 'flex'
  console.clear();
}


// %%%%%%%%%%% DISPLAY SCORE AND CORRECT & SELECTED ANSWERS %%%%%%%%

function addAnswer(id, data) {
  const question = document.createElement("P");
  question.classList.add("question");
  const correctAnswer = document.createElement("P");
  correctAnswer.classList.add("green");
  const selectedAnswer = document.createElement("P");
  selectedAnswer.classList.add("red");
  question.innerHTML = `Q${id + 1}. ${data[id].question}`;
  correctAnswer.innerHTML = `A: ${data[id].correct}`;
  selectedAnswer.innerHTML = `A: ${data[id].selected}`;
  let corAns = data[id].correct;
  let selAns = data[id].selected;
  if (selAns === corAns) {
    quizContainer.append(question);
    quizContainer.append(correctAnswer);
  } else {
    quizContainer.append(question);
    quizContainer.append(correctAnswer);
    quizContainer.append(selectedAnswer);
  }
}

//  function for the SCORE button

function displayScore() {
  removeItem();
  showScore.disabled = true;
  try {
    if (id < questions.length) {
      const quizScore = document.createElement("P");
      quizScore.style.fontSize = '28';
      quizScore.innerHTML = `<b>Your score is <span class="red">${score}</span> out of ${id - 1}</b>`;
      quizContainer.append(quizScore);
      for (let i = 0; i <= questions.length; i++) {
        addAnswer(i, answers);
      }
    } else if (id === questions.length) {
      const quizScore = document.createElement("P");
      quizScore.style.fontSize = '28';
      quizScore.innerHTML = `<b>Your score is <span class="red">${score}</span> out of ${id}</b>`;
      quizContainer.append(quizScore);
      for (let i = 0; i <= questions.length; i++) {
        addAnswer(i, answers);
      }
    }
  } catch (error) {
    console.error('Ignore it');
  }
}

newQuiz.addEventListener("click", saveQuestions);
newQuestion.addEventListener("click", addQuestion);
reset.addEventListener("click", resetQuiz);
showScore.addEventListener("click", displayScore);
token.addEventListener("click", generateToken);