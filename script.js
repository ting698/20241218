let questions = [];
let currentQuestionIndex = 0; // 追踪當前題目索引

window.onload = async function() {
    try {
        console.log('開始載入題目...');
        const response = await fetch('question.xlsx');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
            throw new Error('Excel 檔案中沒有數據！');
        }

        questions = jsonData.map((row, index) => ({
            id: index + 1,
            question: row.question || `題目 ${index + 1}`,
            options: [
                row.optionA || 'A',
                row.optionB || 'B',
                row.optionC || 'C',
                row.optionD || 'D'
            ],
            correctAnswer: parseInt(row.correctAnswer) || 0
        }));

        displayCurrentQuestion();
        updateNavigationButtons();
        
    } catch (error) {
        console.error('載入題目時發生錯誤:', error);
        document.getElementById('questionContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                載入題目時發生錯誤：${error.message}
            </div>
        `;
    }
}

function displayCurrentQuestion() {
    const container = document.getElementById('questionContainer');
    const question = questions[currentQuestionIndex];
    
    container.innerHTML = `
        <div class="question-info">
            <span class="question-number">
                <i class="fas fa-bookmark"></i> 
                題目 ${currentQuestionIndex + 1} / ${questions.length}
            </span>
        </div>
        <div class="question">
            <h3>
                <i class="fas fa-question-circle"></i> 
                ${question.question}
            </h3>
            <div class="options">
                ${question.options.map((option, i) => `
                    <label>
                        <input type="radio" name="q${question.id}" value="${i}"
                        ${isAnswered(question.id, i) ? 'checked' : ''}>
                        <i class="far fa-circle option-icon"></i> ${option}
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="navigation-buttons">
            <button onclick="previousQuestion()" id="prevBtn" class="nav-btn">
                <i class="fas fa-chevron-left"></i> 上一題
            </button>
            <button onclick="nextQuestion()" id="nextBtn" class="nav-btn">
                ${currentQuestionIndex === questions.length - 1 ? '提交答案 <i class="fas fa-paper-plane"></i>' : '下一題 <i class="fas fa-chevron-right"></i>'}
            </button>
        </div>
    `;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
    }
    
    if (nextBtn) {
        nextBtn.innerHTML = currentQuestionIndex === questions.length - 1 
            ? '提交答案 <i class="fas fa-paper-plane"></i>' 
            : '下一題 <i class="fas fa-chevron-right"></i>';
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
        updateNavigationButtons();
    }
}

function nextQuestion() {
    if (currentQuestionIndex === questions.length - 1) {
        submitQuiz();
    } else {
        currentQuestionIndex++;
        displayCurrentQuestion();
        updateNavigationButtons();
    }
}

// 保存答案
let userAnswers = {};

function isAnswered(questionId, optionIndex) {
    return userAnswers[questionId] === optionIndex;
}

// 在選項改變時保存答案
document.addEventListener('change', function(e) {
    if (e.target.type === 'radio') {
        const questionId = e.target.name.substring(1);
        userAnswers[questionId] = parseInt(e.target.value);
    }
});

function submitQuiz() {
    let score = 0;
    questions.forEach((q, index) => {
        if (userAnswers[q.id] === q.correctAnswer) {
            score++;
        }
    });

    const finalScore = Math.round((score / questions.length) * 100);
    
    document.getElementById('quizSection').innerHTML = `
        <div class="result-section">
            <h2><i class="fas fa-star"></i> 測驗結果 <i class="fas fa-star"></i></h2>
            <div class="result-content">
                <i class="fas fa-trophy result-icon"></i>
                <p class="final-score">得分：${finalScore}分</p>
                <p class="feedback">
                    ${finalScore >= 90 ? '<i class="fas fa-grin-stars"></i> 好厲害！' :
                      finalScore < 60 ? '<i class="fas fa-sad-tear"></i> 再加油！' :
                      '<i class="fas fa-smile"></i> 做得不錯！'}
                </p>
                <button onclick="location.reload()" class="restart-btn">
                    <i class="fas fa-redo"></i> 重新開始
                </button>
            </div>
        </div>
    `;
} 