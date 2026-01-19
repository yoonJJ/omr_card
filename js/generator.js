function clampNumber(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function getConfigFromForm() {
  const subjects = clampNumber(document.getElementById('subjectsInput').value, 1, 10);
  const questions = clampNumber(document.getElementById('questionsInput').value, 1, 200);
  const pass = clampNumber(document.getElementById('passInput').value, 0, 100);
  const min = clampNumber(document.getElementById('minSubjectInput').value, 0, 100);
  const choices = clampNumber(document.getElementById('choicesInput').value, 2, 8);

  return { subjects, questions, pass, min, choices };
}

function setSubjects(value) {
  const input = document.getElementById('subjectsInput');
  input.value = String(clampNumber(value, 1, 10, 1));
  setPreview();
}

function setPreview() {
  const { subjects, questions, pass, min, choices } = getConfigFromForm();
  const preview = document.getElementById('previewText');
  preview.textContent = `과목 ${subjects}개 · 과목당 ${questions}문항 · 합격(평균) ${pass}점 · 과락(과목) ${min}점 · 보기 ${choices}개`;
}

function generate() {
  const { subjects, questions, pass, min, choices } = getConfigFromForm();
  const params = new URLSearchParams({
    subjects: String(subjects),
    questions: String(questions),
    pass: String(pass),
    min: String(min),
    choices: String(choices)
  });

  window.location.href = `computer-applied.html?${params.toString()}`;
}

document.getElementById('generateBtn').addEventListener('click', generate);
document.getElementById('subjectsMinusBtn').addEventListener('click', () => {
  const { subjects } = getConfigFromForm();
  setSubjects(subjects - 1);
});
document.getElementById('subjectsPlusBtn').addEventListener('click', () => {
  const { subjects } = getConfigFromForm();
  setSubjects(subjects + 1);
});
['subjectsInput', 'questionsInput', 'passInput', 'minSubjectInput', 'choicesInput'].forEach((id) => {
  document.getElementById(id).addEventListener('input', setPreview);
});

setPreview();

