const CHAPTERS = [
  { id: "chapter1", label: "Chapter1", name: "宅建業法", count: 112 },
  { id: "chapter2", label: "Chapter2", name: "権利関係", count: 100 },
  { id: "chapter3", label: "Chapter3", name: "法令上の制限", count: 63 },
  { id: "chapter4", label: "Chapter4", name: "税・その他", count: 47 },
];

const TOPIC_RANGES = {
  chapter1: [
    [1, 4, "宅建業法の基本"],
    [5, 17, "免許"],
    [18, 24, "宅地建物取引士"],
    [25, 31, "営業保証金"],
    [32, 37, "保証協会"],
    [38, 45, "事務所・案内所等に関する規制"],
    [46, 80, "業務上の規制"],
    [81, 94, "8種制限"],
    [95, 102, "報酬に関する制限"],
    [103, 110, "監督・罰則"],
    [111, 112, "住宅瑕疵担保履行法"],
  ],
  chapter2: [
    [1, 4, "制限行為能力者"],
    [5, 9, "意思表示"],
    [10, 15, "代理・表見代理"],
    [16, 19, "時効"],
    [20, 24, "債務不履行・解除・危険負担"],
    [25, 29, "弁済・相殺・債権譲渡"],
    [30, 34, "売主の担保責任"],
    [35, 39, "物権変動"],
    [40, 46, "抵当権"],
    [47, 50, "保証・連帯債務"],
    [51, 55, "賃貸借"],
    [56, 61, "借地借家法（借地）"],
    [62, 69, "借地借家法（借家）"],
    [70, 71, "請負"],
    [72, 75, "不法行為"],
    [76, 81, "相続"],
    [82, 83, "共有"],
    [84, 88, "区分所有法"],
    [89, 93, "不動産登記法"],
    [94, 94, "担保物権"],
    [95, 95, "担保物権（留置権）"],
    [96, 96, "根抵当権"],
    [97, 97, "委任"],
    [98, 98, "相隣関係"],
    [99, 99, "配偶者居住権"],
    [100, 100, "条件"],
  ],
  chapter3: [
    [1, 6, "都市計画法"],
    [7, 16, "都市計画法（開発許可）"],
    [17, 33, "建築基準法"],
    [34, 41, "国土利用計画法"],
    [42, 47, "農地法"],
    [48, 55, "盛土規制法"],
    [56, 61, "土地区画整理法"],
    [62, 63, "その他の法令上の制限"],
  ],
  chapter4: [
    [1, 15, "不動産に関する税金"],
    [16, 20, "不動産鑑定評価基準"],
    [21, 24, "地価公示法"],
    [25, 28, "住宅金融支援機構法"],
    [29, 35, "景品表示法"],
    [36, 47, "土地・建物"],
  ],
};

const RATINGS = ["good", "ok", "bad"];
const RATING_LABELS = {
  good: "○",
  ok: "△",
  bad: "×",
};
const STORAGE_KEY = "takken-tracker-2026-v1";
const NOTES_STORAGE_KEY = "takken-tracker-notes-2026-v1";

const state = {
  activeChapterId: CHAPTERS[0].id,
  filter: "all",
  answers: loadAnswers(),
  notes: loadNotes(),
};

const chapterTabs = document.querySelector("#chapterTabs");
const dashboardLead = document.querySelector("#dashboardLead");
const dashboardGrid = document.querySelector("#dashboardGrid");
const topicInsights = document.querySelector("#topicInsights");
const dashboardTemplate = document.querySelector("#dashboardTemplate");
const analysisLead = document.querySelector("#analysisLead");
const analysisGrid = document.querySelector("#analysisGrid");
const reviewTotal = document.querySelector("#reviewTotal");
const chapterTitle = document.querySelector("#chapterTitle");
const chapterProgress = document.querySelector("#chapterProgress");
const chapterCounts = document.querySelector("#chapterCounts");
const questionGrid = document.querySelector("#questionGrid");
const questionTemplate = document.querySelector("#questionTemplate");
const filterSelect = document.querySelector("#filterSelect");
const resetButton = document.querySelector("#resetButton");
const saveState = document.querySelector("#saveState");

const ratedTotal = document.querySelector("#ratedTotal");
const totalCount = document.querySelector("#totalCount");
const goodTotal = document.querySelector("#goodTotal");
const okTotal = document.querySelector("#okTotal");
const badTotal = document.querySelector("#badTotal");

init();

function init() {
  render();

  if (filterSelect) filterSelect.addEventListener("change", () => {
    state.filter = filterSelect.value;
    renderQuestions();
  });

  if (resetButton) resetButton.addEventListener("click", resetAll);
}

function loadAnswers() {
  const fallback = {};

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : fallback;
  } catch {
    return fallback;
  }
}

function loadNotes() {
  const fallback = {};

  try {
    const saved = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : fallback;
  } catch {
    return fallback;
  }
}

function saveAnswers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers));
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(state.notes));
  saveState.textContent = "保存しました";
  saveState.classList.add("is-active");
  window.setTimeout(() => {
    saveState.textContent = "保存済み";
    saveState.classList.remove("is-active");
  }, 900);
}

function render() {
  renderSummary();
  renderTabs();
  renderDashboard();
  renderAutoAnalysis();
  renderChapterHead();
  renderQuestions();
}

function renderSummary() {
  if (!ratedTotal || !totalCount || !goodTotal || !okTotal || !badTotal) return;
  const totals = getTotals();

  ratedTotal.textContent = totals.rated;
  totalCount.textContent = `/ ${totals.total}`;
  goodTotal.textContent = totals.good;
  okTotal.textContent = totals.ok;
  badTotal.textContent = totals.bad;
}

function renderTabs() {
  if (!chapterTabs) return;
  chapterTabs.innerHTML = "";

  CHAPTERS.forEach((chapter) => {
    const counts = getChapterCounts(chapter);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chapter-tab";
    button.classList.toggle("is-active", chapter.id === state.activeChapterId);
    button.innerHTML = `<strong>${chapter.label}</strong><span>${chapter.name}</span><span>${counts.rated} / ${chapter.count}</span>`;
    button.addEventListener("click", () => {
      state.activeChapterId = chapter.id;
      state.filter = "all";
      if (filterSelect) filterSelect.value = "all";
      render();
    });
    chapterTabs.append(button);
  });
}

function renderChapterHead() {
  if (!chapterTitle || !chapterProgress || !chapterCounts) return;
  const chapter = getActiveChapter();
  const counts = getChapterCounts(chapter);

  chapterTitle.textContent = `${chapter.label} ${chapter.name}`;
  chapterProgress.textContent = `${counts.rated} / ${chapter.count} 評価済み`;
  chapterCounts.innerHTML = RATINGS.map((rating) => {
    return `<span class="count-pill ${rating}">${RATING_LABELS[rating]} ${counts[rating]}</span>`;
  }).join("");
}

function renderQuestions() {
  if (!questionGrid || !questionTemplate) return;
  const chapter = getActiveChapter();
  questionGrid.innerHTML = "";

  for (let number = 1; number <= chapter.count; number += 1) {
    const key = getQuestionKey(chapter.id, number);
    const rating = state.answers[key] || "";
    const note = state.notes[key] || "";
    const topic = getTopic(chapter.id, number);
    const card = questionTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.rating = rating;
    card.dataset.chapter = chapter.id;
    card.dataset.question = String(number);
    card.dataset.topic = topic;
    card.classList.toggle("is-hidden", shouldHideQuestion(rating));
    card.querySelector(".question-number").textContent = `問 ${number}`;
    card.querySelector(".question-topic").textContent = topic;

    const noteInput = card.querySelector(".note-input");
    noteInput.value = note;
    noteInput.setAttribute("aria-label", `問${number}のメモ`);
    noteInput.addEventListener("change", () => {
      setNote(chapter.id, number, noteInput.value.trim());
    });

    card.querySelectorAll(".rate-button").forEach((button) => {
      const buttonRating = button.dataset.rating;
      button.setAttribute("aria-label", `問${number}を${RATING_LABELS[buttonRating]}にする`);
      button.classList.toggle("is-selected", buttonRating === rating);
      button.addEventListener("click", () => {
        setRating(chapter.id, number, buttonRating);
      });
    });

    questionGrid.append(card);
  }
}

function renderDashboard() {
  if (!dashboardGrid || !dashboardTemplate) return;
  const totals = getTotals();
  dashboardGrid.innerHTML = "";
  if (reviewTotal) reviewTotal.textContent = totals.ok + totals.bad;
  if (dashboardLead) dashboardLead.textContent = totals.rated
    ? `全体の評価率 ${getPercent(totals.rated, totals.total)}% / ○率 ${getPercent(totals.good, totals.rated)}%`
    : "まだ評価がありません";

  CHAPTERS.forEach((chapter) => {
    const counts = getChapterCounts(chapter);
    const card = dashboardTemplate.content.firstElementChild.cloneNode(true);
    const ratedPercent = getPercent(counts.rated, counts.total);
    const goodPercent = getPercent(counts.good, counts.rated);
    const okPercent = getPercent(counts.ok, counts.rated);
    const badPercent = getPercent(counts.bad, counts.rated);

    card.querySelector(".dashboard-chapter").textContent = `${chapter.label} ${chapter.name}`;
    card.querySelector(".dashboard-progress").textContent = `${ratedPercent}%`;
    card.querySelector(".bar-good").style.width = `${goodPercent}%`;
    card.querySelector(".bar-ok").style.width = `${okPercent}%`;
    card.querySelector(".bar-bad").style.width = `${badPercent}%`;
    card.querySelector(".dashboard-counts").innerHTML = `
      <span>評価 ${counts.rated}/${counts.total}</span>
      <span>○ ${counts.good}</span>
      <span>△ ${counts.ok}</span>
      <span>× ${counts.bad}</span>
    `;
    dashboardGrid.append(card);
  });

  renderTopicInsights();
}

function renderTopicInsights() {
  if (!topicInsights) return;
  const topics = getTopicStats()
    .filter((topic) => topic.rated > 0)
    .sort((a, b) => (b.ok + b.bad) - (a.ok + a.bad) || b.bad - a.bad)
    .slice(0, 8);

  if (!topics.length) {
    topicInsights.innerHTML = "";
    return;
  }

  topicInsights.innerHTML = `
    <div class="topic-insights-head">
      <strong>分類別の復習候補</strong>
      <span>△と×が多い順</span>
    </div>
    <div class="topic-chip-list">
      ${topics.map((topic) => `
        <span class="topic-chip">
          <strong>${topic.name}</strong>
          <small>${topic.chapterName} / △${topic.ok} ×${topic.bad}</small>
        </span>
      `).join("")}
    </div>
  `;
}

function renderAutoAnalysis() {
  if (!analysisGrid || !analysisLead) return;

  const totals = getTotals();
  const reviewCount = totals.ok + totals.bad;
  if (reviewTotal) reviewTotal.textContent = reviewCount;

  if (!totals.rated) {
    analysisLead.textContent = "評価を入れると、苦手な分類と次に見るべき問題を自動で出します";
    analysisGrid.innerHTML = `
      <article class="analysis-card">
        <strong>分析待ち</strong>
        <p>まずは数問だけでも○△×を入れると、章別・分類別の傾向が見えます。</p>
      </article>
    `;
    return;
  }

  const chapterStats = CHAPTERS.map((chapter) => ({
    ...chapter,
    counts: getChapterCounts(chapter),
  })).filter((chapter) => chapter.counts.rated > 0);
  const topicStats = getTopicStats().filter((topic) => topic.rated > 0);
  const weakTopics = [...topicStats].sort(compareWeakness).slice(0, 3);
  const weakChapter = [...chapterStats].sort((a, b) => {
    return getReviewRate(b.counts) - getReviewRate(a.counts) || b.counts.bad - a.counts.bad;
  })[0];
  const goodRate = getPercent(totals.good, totals.rated);
  const reviewedRate = getPercent(totals.rated, totals.total);
  const badRate = getPercent(totals.bad, totals.rated);
  const primaryTopic = weakTopics[0];

  analysisLead.textContent = `評価率 ${reviewedRate}% / ○率 ${goodRate}% / ×率 ${badRate}%`;
  analysisGrid.innerHTML = [
    makeAnalysisCard(
      "最優先",
      primaryTopic
        ? `${primaryTopic.name} がいちばん復習候補に出ています。△${primaryTopic.ok}・×${primaryTopic.bad}なので、まずこの分類をまとめて解き直すのが効率的です。`
        : "いまのところ大きく崩れている分類はありません。未評価を進めると、より正確に見えます。"
    ),
    makeAnalysisCard(
      "章の傾向",
      weakChapter
        ? `${weakChapter.name} は評価済み${weakChapter.counts.rated}問中、△×が${weakChapter.counts.ok + weakChapter.counts.bad}問です。章単位ではここを重点復習に回すとよさそうです。`
        : "章別の傾向はまだ出ていません。"
    ),
    makeAnalysisCard(
      "次の一手",
      makeNextAction(totals, weakTopics)
    ),
  ].join("");
}

function makeAnalysisCard(title, body) {
  return `
    <article class="analysis-card">
      <strong>${title}</strong>
      <p>${body}</p>
    </article>
  `;
}

function makeNextAction(totals, weakTopics) {
  if (totals.rated < 10) {
    return "まだ評価数が少ないので、まず各章から数問ずつ評価して分析の土台を作るのがよさそうです。";
  }

  if (totals.bad > totals.ok) {
    return "×が△より多めです。新しい問題を進めるより、×だけに絞って再挑戦する日を作ると効果が出やすいです。";
  }

  if (weakTopics.length >= 2) {
    return `${weakTopics[0].name} と ${weakTopics[1].name} を続けて復習すると、弱点のまとまりをつぶしやすいです。`;
  }

  return "△を○に変える復習が中心でよさそうです。メモ欄に引っかかった理由を残すと、次回の分析精度も上がります。";
}

function setRating(chapterId, number, rating) {
  const key = getQuestionKey(chapterId, number);

  if (state.answers[key] === rating) {
    delete state.answers[key];
  } else {
    state.answers[key] = rating;
  }

  saveAnswers();
  render();
}

function setNote(chapterId, number, note) {
  const key = getQuestionKey(chapterId, number);

  if (note) {
    state.notes[key] = note;
  } else {
    delete state.notes[key];
  }

  saveAnswers();
  renderQuestions();
}

function shouldHideQuestion(rating) {
  if (state.filter === "all") return false;
  if (state.filter === "blank") return Boolean(rating);

  return rating !== state.filter;
}

function getActiveChapter() {
  return CHAPTERS.find((chapter) => chapter.id === state.activeChapterId) || CHAPTERS[0];
}

function getQuestionKey(chapterId, number) {
  return `${chapterId}-${number}`;
}

function getTopic(chapterId, number) {
  const ranges = TOPIC_RANGES[chapterId] || [];
  const range = ranges.find(([start, end]) => number >= start && number <= end);
  return range ? range[2] : "分類未設定";
}

function getChapterCounts(chapter) {
  const counts = { total: chapter.count, rated: 0, good: 0, ok: 0, bad: 0 };

  for (let number = 1; number <= chapter.count; number += 1) {
    const rating = state.answers[getQuestionKey(chapter.id, number)];
    if (!rating) continue;
    counts.rated += 1;
    counts[rating] += 1;
  }

  return counts;
}

function getTotals() {
  return CHAPTERS.reduce((totals, chapter) => {
    const counts = getChapterCounts(chapter);
    totals.total += chapter.count;
    totals.rated += counts.rated;
    totals.good += counts.good;
    totals.ok += counts.ok;
    totals.bad += counts.bad;
    return totals;
  }, { total: 0, rated: 0, good: 0, ok: 0, bad: 0 });
}

function getTopicStats() {
  const stats = [];

  CHAPTERS.forEach((chapter) => {
    (TOPIC_RANGES[chapter.id] || []).forEach(([start, end, name]) => {
      const item = {
        chapterId: chapter.id,
        chapterName: chapter.name,
        name,
        total: end - start + 1,
        rated: 0,
        good: 0,
        ok: 0,
        bad: 0,
      };

      for (let number = start; number <= end; number += 1) {
        const rating = state.answers[getQuestionKey(chapter.id, number)];
        if (!rating) continue;
        item.rated += 1;
        item[rating] += 1;
      }

      stats.push(item);
    });
  });

  return stats;
}

function compareWeakness(a, b) {
  return getReviewRate(b) - getReviewRate(a) || b.bad - a.bad || b.rated - a.rated;
}

function getReviewRate(counts) {
  if (!counts.rated) return 0;
  return ((counts.ok + counts.bad) / counts.rated) * 100;
}

function getPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function resetAll() {
  const confirmed = window.confirm("すべての評価をリセットしますか？");
  if (!confirmed) return;

  state.answers = {};
  state.notes = {};
  saveAnswers();
  render();
}
