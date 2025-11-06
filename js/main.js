const QUESTIONS_PER_SUBJECT = 20;
const SUBJECTS = 3;
const PASS_THRESHOLD = 70; // 평균 합격 기준
const MIN_SUBJECT_SCORE = 40; // 과목별 최소 점수 (과락 기준)

// 각 과목별 점수 저장
const scores = {
    1: 0,
    2: 0,
    3: 0
};

// 문제 생성 함수
function createQuestion(subjectNum, questionNum) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.innerHTML = `
        <div class="question-header">
            <span class="question-number">${questionNum}번</span>
            <input type="number" 
                   class="answer-input" 
                   id="answer_${subjectNum}_${questionNum}" 
                   placeholder="정답"
                   min="0"
                   max="999">
            <div class="checkboxes">
                <div class="checkbox-group">
                    <input type="checkbox" 
                           id="correct_${subjectNum}_${questionNum}" 
                           class="correct-checkbox"
                           data-subject="${subjectNum}"
                           data-question="${questionNum}">
                    <label for="correct_${subjectNum}_${questionNum}">맞음</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" 
                           id="wrong_${subjectNum}_${questionNum}" 
                           class="wrong-checkbox"
                           data-subject="${subjectNum}"
                           data-question="${questionNum}">
                    <label for="wrong_${subjectNum}_${questionNum}">틀림</label>
                </div>
            </div>
        </div>
    `;
    return questionDiv;
}

// 문제들 생성
for (let subject = 1; subject <= SUBJECTS; subject++) {
    const questionsContainer = document.getElementById(`questions${subject}`);
    for (let question = 1; question <= QUESTIONS_PER_SUBJECT; question++) {
        const questionElement = createQuestion(subject, question);
        questionsContainer.appendChild(questionElement);
    }
}

// 맞음/틀림 체크박스 상호 배타적 처리
document.querySelectorAll('.correct-checkbox, .wrong-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const subject = this.dataset.subject;
        const question = this.dataset.question;
        const isCorrect = this.classList.contains('correct-checkbox');
        const otherCheckbox = document.getElementById(
            isCorrect ? `wrong_${subject}_${question}` : `correct_${subject}_${question}`
        );

        if (this.checked) {
            otherCheckbox.checked = false;
            calculateScore();
        }
    });
});

// 점수 계산 함수
function calculateScore() {
    for (let subject = 1; subject <= SUBJECTS; subject++) {
        let correctCount = 0;
        for (let question = 1; question <= QUESTIONS_PER_SUBJECT; question++) {
            const correctCheckbox = document.getElementById(`correct_${subject}_${question}`);
            if (correctCheckbox && correctCheckbox.checked) {
                correctCount++;
            }
        }
        // 각 문제는 5점 (100점 만점 / 20문제)
        scores[subject] = correctCount * 5;
        document.getElementById(`score${subject}`).textContent = `${scores[subject]}점`;
    }

    // 평균 계산
    const total = scores[1] + scores[2] + scores[3];
    const average = total / SUBJECTS;
    document.getElementById('average').textContent = `${average.toFixed(1)}점`;

    // 결과 판정
    checkResult();
}

// 결과 판정 함수
function checkResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    // 과락 체크 (한 과목이라도 40점 이하면 과락)
    const hasFail = Object.values(scores).some(score => score < MIN_SUBJECT_SCORE);
    const average = (scores[1] + scores[2] + scores[3]) / SUBJECTS;

    if (hasFail) {
        resultDiv.textContent = '과락 (40점 미만 과목 존재)';
        resultDiv.className = 'result fail';
    } else if (average >= PASS_THRESHOLD) {
        resultDiv.textContent = '합격';
        resultDiv.className = 'result pass';
    } else {
        resultDiv.textContent = '불합격';
        resultDiv.className = 'result fail';
    }
}

// 초기 점수 계산
calculateScore();

