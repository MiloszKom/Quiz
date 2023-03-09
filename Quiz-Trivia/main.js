const Qnumber = document.getElementById("Qnumber")
const Qcategory = document.getElementById("Qcategory")
const Qdifficulty = document.getElementById("Qdifficulty")
const container = document.querySelector(".container")
let answerSelected = false
let totalQuestions
let currentQuestion = 1;
let score = 0;
let numberForNanoId = 0;
let arrayOfQuestions = []
let apiLink = ""


function nanoid () {
    numberForNanoId++
    return numberForNanoId;
}

function  apiLinkConstructor (num, cat, dif) {
    totalQuestions=Qnumber.value
    if(num>20) {
        num = 20
        totalQuestions=20
    }
    apiLink = `https://opentdb.com/api.php?amount=${num}`
    if(cat!="default") {
        apiLink +=`&category=${cat}`
    }
    if(dif!="default") {
        apiLink +=`&difficulty=${dif}`
    }

    apiLink+=`&type=multiple`
}

async function getQuestion () {
    const response = await fetch(apiLink)
    const data = await response.json()
    
    let objectWithAnswers = []

    data.results.map(item => {

        objectWithAnswers = []

        for(let i=0; i<item.incorrect_answers.length; i++) {
            objectWithAnswers.push({
                "answer":item.incorrect_answers[i],
                "isChosen":false,
                "isCorrect":false,
                "id":nanoid()
            })
        }

        objectWithAnswers.splice(Math.round(Math.random()*3), 0, {
            "answer":item.correct_answer,
            "isChosen":false,
            "isCorrect":true,
            "id":nanoid()
        })

        arrayOfQuestions.push(
            {
                "question":item.question,
                "answers":objectWithAnswers,
                "id":nanoid()
            }  
        )
    })
    renderQuestion(arrayOfQuestions[currentQuestion-1])
}

document.addEventListener("click", function(e){
    if(e.target.dataset.handle == "start") {
        apiLinkConstructor(Qnumber.value, Qcategory.value, Qdifficulty.value)
        getQuestion()
    }
    if(e.target.dataset.handle  == "next") {
        nextQuestion()
    }
    if(e.target.dataset.handle == "prev") {
        previousQuestion()
    }
    if(e.target.dataset.handle == "answer") { 
        selectAnswer(e.target.id)
    }
    if(e.target.dataset.handle == "show-more") {
        showResults(e.target.id)
    }
    if(e.target.dataset.handle == "play-again") {
        answerSelected = false
        currentQuestion = 1;
        score = 0;
        numberForNanoId = 0;
        arrayOfQuestions = []
        getQuestion()
    }
})

function selectAnswer(id) {
    answerSelected = true
    for (let answer of arrayOfQuestions[currentQuestion-1].answers)  {
        answer.id==id? answer.isChosen = true:
        answer.isChosen = false 
    }
    renderQuestion(arrayOfQuestions[currentQuestion-1])
}

function nextQuestion() {
    if(currentQuestion!=totalQuestions) {
        answerSelected = false
        currentQuestion++
        renderQuestion(arrayOfQuestions[currentQuestion-1])
    } else {
        showResults()
    }
}

function previousQuestion () {
    currentQuestion--
    renderQuestion(arrayOfQuestions[currentQuestion-1])
}

function showResults(id) {
    score = 0
    number = 0
    results=""
    info=""

    for(let result of arrayOfQuestions) {
        let answeredCorrectly = false
        for(let answer of result.answers) {
            if(answer.isChosen) {
                if(answer.isCorrect) {
                    answeredCorrectly = true
                    score++
                }      
            }
        }

        number++
        let style = answeredCorrectly? "correct": "incorrect"

        if(id) {
            if(id==number) style = answeredCorrectly? "highlight-green": "highlight-red"
        }

        results+=`
        <div class="square ${style}" data-handle="show-more" id=${number}>
        ${number}
        </div>
        `
    }

    let infoStyle = ""

    if(id) {
        let chosenAnswer
        let correctAnswer
        for(let item of arrayOfQuestions[id-1].answers) {
            if(item.isChosen) chosenAnswer = item.answer
            if(item.isCorrect) correctAnswer = item.answer
        }
        
        infoStyle = "padding:1rem 1rem"

        info=`
        <h3 class="info-question-title">Question</h3>
        <h3 class="info-correct-answer-title">Correct Answer</h3>
        <h3 class="info-your-answer-title">Your Answer</h3>
        <div class="info-question">${arrayOfQuestions[id-1].question}</div> 
        <div class="info-correct-answer">${correctAnswer}</div>
        <div class="info-your-answer">${chosenAnswer}</div>
        `
    }

    let barStyle1 = `width:${(score/totalQuestions)*100}%`
    let barStyle2 = `width:${100 - (score/totalQuestions)*100}%`

    html=`
        <div class="results">
            <h1>Your Results</h1>
            <div class="squares">
                ${results}
            </div>
            <h3>Click on a square to see more information</h3>
            <div class="info" style=${infoStyle}>
                ${info}
            </div>
            <div class="bar-score">
                <div class="bar-green" style=${barStyle1}></div>
                <div class="bar-red" style=${barStyle2}></div>
                <h1>${Math.round((score/totalQuestions)*100)}% (${score}/${totalQuestions})</h1>
            </div>
            <button class="btn-start" data-handle="play-again">Play Again</button>
        </div>
    `

    container.innerHTML=html
}

function renderQuestion (questionData) {
    let buttonText = currentQuestion==totalQuestions? "Show Results":"Next Question"
    let barStyle1 = `width:${(currentQuestion/totalQuestions)*100}%`
    let barStyle2 = `width:${100 - (currentQuestion/totalQuestions)*100}%`
    
    html=""
    html2=""
    
    for(let itemAnswer of questionData.answers) {

        if(itemAnswer.isChosen)  {
            answerSelected = true
        }

        itemAnswer.isChosen?
        chosenStyle="active":
        chosenStyle="not-active"


        html2+=`
        <div class="answer ${chosenStyle}" id="${itemAnswer.id}"  data-handle="answer">
            ${itemAnswer.answer}
        </div>
        `
    }

    let buttonStyleNext = answerSelected?  "enabled":"disabled"
    let buttonStylePrevious = currentQuestion>1? "enabled":"disabled"

    html+=`
    <div class="question">
        <div class="question-box">
            <h1>${questionData.question}</h1>
        </div>
        <div class="answers">
            ${html2}
        </div>
    </div>
    
    <div class="bar-box">
        <div class="bar" style=${barStyle1}></div>
        <div class="sub-bar" style=${barStyle2}>
    </div>

    <div class="buttons-container">
        <h3>Question ${currentQuestion}/${totalQuestions}</h3>
        <button class="btn-nav" ${buttonStylePrevious} data-handle="prev" >Previous Question</button>
        <button class="btn-nav" ${buttonStyleNext} data-handle="next" >${buttonText}</button>
    </div>
    `

    container.innerHTML=html
}