
const lessons = window.GRIMOIRE_LESSONS || [];
let current = 0;
let showNotes = true;

const book = document.getElementById('book');
const leftPage = document.getElementById('leftPage');
const rightPage = document.getElementById('rightPage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressLabel = document.getElementById('progressLabel');
const chapterTitle = document.getElementById('chapterTitle');
const progressBar = document.getElementById('progressBar');
const chapterList = document.getElementById('chapterList');
const lessonSearch = document.getElementById('lessonSearch');
const tocDialog = document.getElementById('tocDialog');
const tocGrid = document.getElementById('tocGrid');
const openToc = document.getElementById('openToc');
const closeToc = document.getElementById('closeToc');
const toggleNotes = document.getElementById('toggleNotes');

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}
function renderLeft(lesson){
  leftPage.innerHTML = `
    <div class="page-content">
      <div class="chapter-kicker">${escapeHtml(lesson.chapter)} · ${escapeHtml(lesson.id)}</div>
      <h2 class="lesson-title">${escapeHtml(lesson.title)}</h2>
      <p class="lesson-subtitle">${escapeHtml(lesson.subtitle)}</p>
      <div class="tag-row">${lesson.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <p class="lesson-body">${escapeHtml(lesson.principle)}</p>
      <div class="rule-card">
        <h3>咒语骨架</h3>
        <p class="formula">${escapeHtml(lesson.formula)}</p>
      </div>
    </div>`;
}
function renderRight(lesson){
  rightPage.innerHTML = `
    <div class="page-content">
      <figure class="image-frame">
        <img src="${escapeHtml(lesson.image)}" alt="${escapeHtml(lesson.alt)}" loading="${current < 2 ? 'eager' : 'lazy'}" />
      </figure>
      <div class="prompt-card">
        <h3>示例提示词</h3>
        <code>${escapeHtml(lesson.spell)}</code>
        <button class="copy-btn" type="button" data-copy="${escapeHtml(lesson.spell)}">复制提示词</button>
      </div>
      <div class="notes">
        <div class="exercise-card mistake"><h3>常见失误</h3><p>${escapeHtml(lesson.mistake)}</p></div>
        <div class="exercise-card"><h3>小练习</h3><p>${escapeHtml(lesson.exercise)}</p></div>
      </div>
    </div>`;
}
function renderNav(filter = ''){
  const q = filter.trim().toLowerCase();
  const filtered = lessons.map((lesson, index) => ({lesson, index})).filter(({lesson}) => {
    const haystack = [lesson.chapter, lesson.title, lesson.subtitle, lesson.tags.join(' '), lesson.principle].join(' ').toLowerCase();
    return !q || haystack.includes(q);
  });
  chapterList.innerHTML = filtered.map(({lesson, index}) => `
    <button type="button" class="chapter-item ${index === current ? 'active' : ''}" data-index="${index}">
      <small>${escapeHtml(lesson.chapter)}</small>
      <strong>${escapeHtml(lesson.title)}</strong>
      <span>${escapeHtml(lesson.tags.join(' / '))}</span>
    </button>`).join('') || '<div class="sidebar-card"><p>没有找到章节，换个关键词试试。</p></div>';
  tocGrid.innerHTML = lessons.map((lesson, index) => `
    <button type="button" class="toc-card" data-index="${index}">
      <small>${escapeHtml(lesson.chapter)}</small>
      <strong>${escapeHtml(lesson.title)}</strong>
      <span>${escapeHtml(lesson.subtitle)}</span>
    </button>`).join('');
}
function render(direction = 'none'){
  const lesson = lessons[current];
  if(!lesson) return;
  if(direction !== 'none'){
    book.classList.remove('turning','turning-back');
    void book.offsetWidth;
    book.classList.add(direction === 'next' ? 'turning' : 'turning-back');
    setTimeout(() => book.classList.remove('turning','turning-back'), 450);
  }
  renderLeft(lesson);
  renderRight(lesson);
  progressLabel.textContent = `第 ${current + 1} / ${lessons.length} 章`;
  chapterTitle.textContent = lesson.title;
  progressBar.style.width = `${((current + 1) / lessons.length) * 100}%`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === lessons.length - 1;
  prevBtn.setAttribute('aria-disabled', String(current === 0));
  nextBtn.setAttribute('aria-disabled', String(current === lessons.length - 1));
  renderNav(lessonSearch.value);
  history.replaceState(null, '', `#${lesson.id}`);
}
function goTo(index, direction = 'none'){
  const next = Math.max(0, Math.min(lessons.length - 1, index));
  if(next === current) return;
  const dir = direction === 'none' ? (next > current ? 'next' : 'prev') : direction;
  current = next;
  render(dir);
}
function initFromHash(){
  const id = decodeURIComponent(location.hash.replace('#',''));
  const index = lessons.findIndex(lesson => lesson.id === id);
  if(index >= 0) current = index;
}

prevBtn.addEventListener('click', () => goTo(current - 1, 'prev'));
nextBtn.addEventListener('click', () => goTo(current + 1, 'next'));
chapterList.addEventListener('click', event => {
  const btn = event.target.closest('[data-index]');
  if(btn) goTo(Number(btn.dataset.index));
});
tocGrid.addEventListener('click', event => {
  const btn = event.target.closest('[data-index]');
  if(btn){ goTo(Number(btn.dataset.index)); tocDialog.close(); }
});
lessonSearch.addEventListener('input', () => renderNav(lessonSearch.value));
openToc.addEventListener('click', () => tocDialog.showModal());
closeToc.addEventListener('click', () => tocDialog.close());
toggleNotes.addEventListener('click', () => {
  showNotes = !showNotes;
  document.body.classList.toggle('hide-notes', !showNotes);
  toggleNotes.setAttribute('aria-pressed', String(showNotes));
  toggleNotes.textContent = showNotes ? '隐藏练习' : '显示练习';
});
document.addEventListener('click', async event => {
  const btn = event.target.closest('[data-copy]');
  if(!btn) return;
  try{
    await navigator.clipboard.writeText(btn.dataset.copy);
    const old = btn.textContent;
    btn.textContent = '已复制';
    setTimeout(() => btn.textContent = old, 1100);
  }catch(err){
    btn.textContent = '复制失败，请手动选中';
  }
});
document.addEventListener('keydown', event => {
  if(event.key === 'ArrowRight') goTo(current + 1, 'next');
  if(event.key === 'ArrowLeft') goTo(current - 1, 'prev');
  if(event.key === 'Escape' && tocDialog.open) tocDialog.close();
});

let touchStartX = null;
book.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; }, {passive:true});
book.addEventListener('touchend', event => {
  if(touchStartX === null) return;
  const delta = event.changedTouches[0].clientX - touchStartX;
  if(Math.abs(delta) > 60) goTo(current + (delta < 0 ? 1 : -1));
  touchStartX = null;
}, {passive:true});

initFromHash();
render();
