// アプリの起動と、画面（タブ）の切り替えを担当する

// 画面の名前一覧。index.html の id="view-○○" と対応している
const VIEWS = ['review', 'add', 'list', 'data'];
const DEFAULT_VIEW = 'review';

// URLのハッシュ（#review など）から表示する画面名を決める
function getViewFromHash() {
  const name = location.hash.replace(/^#/, '');
  return VIEWS.includes(name) ? name : DEFAULT_VIEW;
}

// 指定した画面だけを表示し、タブとヘッダーの表示を合わせる
function showView(name) {
  for (const view of VIEWS) {
    const section = document.getElementById(`view-${view}`);
    section.hidden = view !== name;
    if (view === name) {
      document.getElementById('view-title').textContent = section.dataset.title;
    }
  }

  for (const tab of document.querySelectorAll('.tab')) {
    const isActive = tab.dataset.view === name;
    tab.classList.toggle('is-active', isActive);
    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  }

  // 画面を切り替えたら先頭までスクロールを戻す
  window.scrollTo(0, 0);
}

// タブ（リンク）を押すとハッシュが変わるので、それに合わせて画面を切り替える
window.addEventListener('hashchange', () => showView(getViewFromHash()));

// 起動時の表示
showView(getViewFromHash());
