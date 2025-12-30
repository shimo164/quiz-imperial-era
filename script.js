let currentEra = null;
let correctCount = 0;
let totalCount = 0;
let hintLevel = 0;
let filteredEraData = eraData;

const $ = (id) => document.getElementById(id);

const ui = {
  setButtonState: (btnId, disabled) => ($(btnId).disabled = disabled),
  setText: (id, text) => ($(id).textContent = text),
  setClass: (id, className) => ($(id).className = className),
  show: (id) => $(id).classList.remove('hidden'),
  hide: (id) => $(id).classList.add('hidden'),
  display: (id, value) => ($(id).style.display = value),
  resetButtons: () =>
    ['submitBtn', 'nextBtn', 'hintBtn', 'resetBtn'].forEach((btn) => ui.setButtonState(btn, true)),
  clearText: () => ['result', 'hint'].forEach((el) => ui.setText(el, '')),
  resetScore: () => ['correct', 'total'].forEach((el) => ui.setText(el, '0')),
  showSubmitBtn: () => {
    $('submitBtn').classList.remove('hidden');
    $('nextBtn').classList.add('hidden');
  },
  showNextBtn: () => {
    $('submitBtn').classList.add('hidden');
    $('nextBtn').classList.remove('hidden');
  },
};

function startQuiz() {
  // 選択された時代でデータをフィルタリング
  const selectedPeriod = JSON.parse(localStorage.getItem('selectedPeriod') || 'null');
  if (selectedPeriod) {
    filteredEraData = eraData.filter(
      (era) => era.start >= selectedPeriod.start && era.start < selectedPeriod.end,
    );
  } else {
    filteredEraData = eraData;
  }

  //   ui.show('scoreDisplay'); <!-- TODO: Consider how to use this section. -->
  ui.hide('startSection');
  ui.show('eraDisplay');
  ui.setButtonState('yearInput', false);
  ui.setButtonState('submitBtn', false);
  ui.setButtonState('hintBtn', false);
  ui.setButtonState('resetBtn', false);
  ui.showSubmitBtn();
  nextQuestion();
}

function nextQuestion() {
  currentEra = filteredEraData[Math.floor(Math.random() * filteredEraData.length)];
  hintLevel = 0;
  updateEraDisplay();
  $('yearInput').value = '';
  $('yearInput').focus();
  ui.clearText();
  ui.setText('hintBtn', 'ヒント');
  ui.setButtonState('hintBtn', false);
  ui.showSubmitBtn();
  ui.setButtonState('nextBtn', true);
  ui.setButtonState('submitBtn', false);
}

function updateEraDisplay() {
  const showReading = $('readingCheckbox').checked;
  const content =
    showReading && currentEra.reading
      ? `<div class="reading">${currentEra.reading}</div><div>${currentEra.name}</div>`
      : `<div>${currentEra.name}</div>`;
  $('eraDisplay').innerHTML = content;
}

function submitAnswer() {
  const userAnswer = parseInt($('yearInput').value);
  totalCount++;

  const isCorrect = userAnswer === currentEra.start;
  if (isCorrect) correctCount++;

  ui.setText('result', isCorrect ? '正解！' : `不正解。正解は${currentEra.start}年です。`);
  ui.setClass('result', `result ${isCorrect ? 'correct' : 'incorrect'}`);
  ui.setText('correct', correctCount);
  ui.setText('total', totalCount);
  ui.setButtonState('submitBtn', true);
  ui.setButtonState('hintBtn', true);
  ui.showNextBtn();
  ui.setButtonState('nextBtn', false);
}

function showHint() {
  const startYear = currentEra.start;
  hintLevel++;

  if (hintLevel === 1) {
    const rangeStart = Math.floor(startYear / 100) * 100;
    ui.setText('hint', `${rangeStart}-${rangeStart + 99}の間`);
    ui.setText('hintBtn', 'さらにヒント');
  } else if (hintLevel === 2) {
    const rangeStart = Math.floor(startYear / 10) * 10;
    ui.setText('hint', `${rangeStart}-${rangeStart + 9}の間`);
    ui.setButtonState('hintBtn', true);
  }
}

function resetQuiz() {
  if (!confirm('クイズをリセットしますか？')) return;

  correctCount = totalCount = hintLevel = 0;
  currentEra = null;

  ui.hide('scoreDisplay');
  ui.show('startSection');
  ui.hide('eraDisplay');
  ui.setButtonState('yearInput', true);
  $('yearInput').value = '';
  ui.showSubmitBtn();
  ui.resetButtons();
  ui.clearText();
  ui.resetScore();
}

function toggleReading() {
  if (currentEra) updateEraDisplay();
}

$('yearInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !$('submitBtn').disabled) submitAnswer();
});
