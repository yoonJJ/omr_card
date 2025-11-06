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
            <div class="choice-buttons">
                <button type="button" class="choice-btn" 
                        data-choice="1"
                        data-subject="${subjectNum}"
                        data-question="${questionNum}"
                        id="choice_${subjectNum}_${questionNum}_1">1</button>
                <button type="button" class="choice-btn" 
                        data-choice="2"
                        data-subject="${subjectNum}"
                        data-question="${questionNum}"
                        id="choice_${subjectNum}_${questionNum}_2">2</button>
                <button type="button" class="choice-btn" 
                        data-choice="3"
                        data-subject="${subjectNum}"
                        data-question="${questionNum}"
                        id="choice_${subjectNum}_${questionNum}_3">3</button>
                <button type="button" class="choice-btn" 
                        data-choice="4"
                        data-subject="${subjectNum}"
                        data-question="${questionNum}"
                        id="choice_${subjectNum}_${questionNum}_4">4</button>
            </div>
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

// 선택지 버튼 클릭 시 처리
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('choice-btn')) {
        const subject = e.target.dataset.subject;
        const question = e.target.dataset.question;
        const choice = e.target.dataset.choice;
        
        // 같은 문제의 다른 버튼들 비활성화
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`choice_${subject}_${question}_${i}`);
            if (btn) {
                btn.classList.remove('selected');
            }
        }
        
        // 선택한 버튼 활성화
        e.target.classList.add('selected');
    }
});

// 맞음/틀림 체크박스 상호 배타적 처리
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('correct-checkbox') || e.target.classList.contains('wrong-checkbox')) {
        const subject = e.target.dataset.subject;
        const question = e.target.dataset.question;
        const isCorrect = e.target.classList.contains('correct-checkbox');
        const otherCheckbox = document.getElementById(
            isCorrect ? `wrong_${subject}_${question}` : `correct_${subject}_${question}`
        );

        if (e.target.checked) {
            if (otherCheckbox) {
                otherCheckbox.checked = false;
            }
            calculateScore();
        } else {
            calculateScore();
        }
    }
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

// 점수 현황 토글 기능
const scoreSection = document.getElementById('scoreSection');
const scoreToggleBtn = document.getElementById('scoreToggleBtn');
const scoreCloseBtn = document.getElementById('scoreCloseBtn');

// 점수 현황 열기
function openScoreSection() {
    scoreSection.classList.remove('hidden');
    scoreToggleBtn.style.display = 'none';
}

// 점수 현황 닫기
function closeScoreSection() {
    scoreSection.classList.add('hidden');
    scoreToggleBtn.style.display = 'block';
}

// 토글 버튼 클릭 시
scoreToggleBtn.addEventListener('click', openScoreSection);

// 닫기 버튼 클릭 시
scoreCloseBtn.addEventListener('click', closeScoreSection);

// 초기 상태: 점수 현황 열림 상태로 시작
openScoreSection();

