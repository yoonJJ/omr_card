const DEFAULT_QUESTIONS_PER_SUBJECT = 20;
const DEFAULT_SUBJECTS = 3;
const DEFAULT_PASS_THRESHOLD = 70; // 평균 합격 기준
const DEFAULT_MIN_SUBJECT_SCORE = 40; // 과목별 최소 점수 (과락 기준)
const DEFAULT_CHOICES_PER_QUESTION = 4;

function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

function getConfig() {
    const params = new URLSearchParams(window.location.search);
    const subjects = clampNumber(params.get('subjects'), 1, 10, DEFAULT_SUBJECTS);
    const questionsPerSubject = clampNumber(params.get('questions'), 1, 200, DEFAULT_QUESTIONS_PER_SUBJECT);
    const passThreshold = clampNumber(params.get('pass'), 0, 100, DEFAULT_PASS_THRESHOLD);
    const minSubjectScore = clampNumber(params.get('min'), 0, 100, DEFAULT_MIN_SUBJECT_SCORE);
    const choicesPerQuestion = clampNumber(params.get('choices'), 2, 8, DEFAULT_CHOICES_PER_QUESTION);

    return {
        subjects,
        passThreshold,
        minSubjectScore,
        choicesPerQuestion,
        questionsPerSubject
    };
}

const CONFIG = getConfig();

// 각 과목별 점수 저장
const scores = {};

// 문제 생성 함수
function createQuestion(subjectNum, questionNum) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    const buttons = Array.from({ length: CONFIG.choicesPerQuestion }, (_, idx) => idx + 1)
        .map((choice) => {
            return `
                <button type="button" class="choice-btn"
                        data-choice="${choice}"
                        data-subject="${subjectNum}"
                        data-question="${questionNum}"
                        id="choice_${subjectNum}_${questionNum}_${choice}">${choice}</button>
            `;
        })
        .join('');

    questionDiv.innerHTML = `
        <div class="question-header">
            <span class="question-number">${questionNum}번</span>
            <div class="choice-buttons">
                ${buttons}
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

function createSubjectSection(subjectNum) {
    const section = document.createElement('div');
    section.className = 'subject-section';
    section.dataset.subject = String(subjectNum);
    section.innerHTML = `
        <div class="subject-title">과목 ${subjectNum}</div>
        <div class="questions-grid" id="questions${subjectNum}"></div>
    `;
    return section;
}

function createScoreItem(subjectNum) {
    const row = document.createElement('div');
    row.className = 'score-item subject';
    row.innerHTML = `
        <span>과목 ${subjectNum}:</span>
        <span id="score${subjectNum}">0점</span>
    `;
    return row;
}

function initPage() {
    const subjectsContainer = document.getElementById('subjectsContainer');
    const scoresContainer = document.getElementById('scoresContainer');

    // 다른 페이지에서 main.js가 로드되더라도 안전하게 종료
    if (!subjectsContainer || !scoresContainer) return;

    // 초기화
    subjectsContainer.innerHTML = '';
    scoresContainer.innerHTML = '';

    for (let subject = 1; subject <= CONFIG.subjects; subject++) {
        scores[subject] = 0;

        scoresContainer.appendChild(createScoreItem(subject));
        subjectsContainer.appendChild(createSubjectSection(subject));

        const questionsContainer = document.getElementById(`questions${subject}`);
        for (let question = 1; question <= CONFIG.questionsPerSubject; question++) {
            questionsContainer.appendChild(createQuestion(subject, question));
        }
    }
}

// 선택지 버튼 클릭 시 처리
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('choice-btn')) {
        const subject = e.target.dataset.subject;
        const question = e.target.dataset.question;
        const choice = e.target.dataset.choice;
        
        // 같은 문제의 다른 버튼들 비활성화
        for (let i = 1; i <= CONFIG.choicesPerQuestion; i++) {
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
    for (let subject = 1; subject <= CONFIG.subjects; subject++) {
        let correctCount = 0;
        for (let question = 1; question <= CONFIG.questionsPerSubject; question++) {
            const correctCheckbox = document.getElementById(`correct_${subject}_${question}`);
            if (correctCheckbox && correctCheckbox.checked) {
                correctCount++;
            }
        }
        // 100점 만점 기준으로 문항당 점수 계산
        const pointsPerQuestion = 100 / CONFIG.questionsPerSubject;
        scores[subject] = correctCount * pointsPerQuestion;
        const scoreEl = document.getElementById(`score${subject}`);
        if (scoreEl) scoreEl.textContent = `${scores[subject].toFixed(1)}점`;
    }

    // 평균 계산
    const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
    const average = total / CONFIG.subjects;
    const avgEl = document.getElementById('average');
    if (avgEl) avgEl.textContent = `${average.toFixed(1)}점`;

    // 결과 판정
    checkResult();
}

// 결과 판정 함수
function checkResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    // 과락 체크 (한 과목이라도 40점 이하면 과락)
    const hasFail = Object.values(scores).some(score => score < CONFIG.minSubjectScore);
    const average = Object.values(scores).reduce((sum, v) => sum + v, 0) / CONFIG.subjects;

    if (hasFail) {
        resultDiv.textContent = `과락 (${CONFIG.minSubjectScore}점 미만 과목 존재)`;
        resultDiv.className = 'result fail';
    } else if (average >= CONFIG.passThreshold) {
        resultDiv.textContent = '합격';
        resultDiv.className = 'result pass';
    } else {
        resultDiv.textContent = '불합격';
        resultDiv.className = 'result fail';
    }
}

// 초기 렌더/점수 계산
initPage();
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

