// 「一覧」画面：登録した単語の一覧・検索・編集・削除

import { deleteCard, findCard, getCards, hasWord, updateCard } from './storage.js';

// 画面の要素（initListView で取得する）
let searchInput;
let countText;
let listElement;
let emptyText;
let dialog;
let editForm;
let editMessage;

// 編集中のカードID
let editingId = null;

// 画面の初期化（起動時に1回だけ呼ぶ）
export function initListView() {
  searchInput = document.getElementById('list-search');
  countText = document.getElementById('list-count');
  listElement = document.getElementById('word-list');
  emptyText = document.getElementById('list-empty');
  dialog = document.getElementById('edit-dialog');
  editForm = document.getElementById('edit-form');
  editMessage = document.getElementById('edit-message');

  // 検索欄に入力するたびに絞り込む
  searchInput.addEventListener('input', renderList);

  // 一覧の項目をタップしたら編集ダイアログを開く
  // （項目ごとではなく一覧全体で1つだけイベントを受け取る）
  listElement.addEventListener('click', (event) => {
    const item = event.target.closest('[data-id]');
    if (item) openEditDialog(item.dataset.id);
  });

  editForm.addEventListener('submit', handleSave);
  document.getElementById('edit-cancel').addEventListener('click', () => dialog.close());
  document.getElementById('edit-delete').addEventListener('click', handleDelete);
  // Escキーなどで閉じた場合も含め、閉じたら編集中の状態を解除する
  dialog.addEventListener('close', () => {
    editingId = null;
  });
}

// 一覧画面を表示するたびに呼ぶ（他の画面での追加・変更を反映する）
export function refreshListView() {
  renderList();
}

// 検索語に合う単語を、新しく追加した順に表示する
function renderList() {
  const allCards = getCards();
  const keyword = searchInput.value.trim().toLowerCase();
  const cards = allCards
    .filter((card) => !keyword
      || card.word.toLowerCase().includes(keyword)
      || card.meaning.toLowerCase().includes(keyword))
    .sort((a, b) => b.createdAt - a.createdAt);

  countText.textContent = keyword
    ? `${cards.length}件 / 全${allCards.length}語`
    : `全${allCards.length}語`;

  const fragment = document.createDocumentFragment();
  for (const card of cards) {
    fragment.append(createListItem(card));
  }
  listElement.replaceChildren(fragment);

  if (cards.length === 0) {
    emptyText.textContent = allCards.length === 0
      ? 'まだ単語がありません。「追加」から登録してください。'
      : '該当する単語がありません';
  }
  emptyText.hidden = cards.length > 0;
}

// 一覧の1行を作る
// CSVから取り込んだ文字がHTMLとして解釈されないよう、innerHTML ではなく textContent を使う
function createListItem(card) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'word-item';
  button.dataset.id = card.id;

  const word = document.createElement('span');
  word.className = 'word-item-word';
  word.lang = 'en';
  word.textContent = card.word;

  const status = document.createElement('span');
  status.className = 'word-item-status';
  status.textContent = card.lastReviewed === null ? '未学習' : `次回 ${card.due}`;

  const meaning = document.createElement('span');
  meaning.className = 'word-item-meaning';
  meaning.textContent = card.meaning;

  button.append(word, status, meaning);
  item.append(button);
  return item;
}

// 編集ダイアログを開き、カードの内容を入力欄に入れる
function openEditDialog(id) {
  const card = findCard(id);
  if (!card) return;

  editingId = id;
  editForm.elements.word.value = card.word;
  editForm.elements.meaning.value = card.meaning;
  editForm.elements.example.value = card.example;
  editMessage.textContent = '';
  dialog.showModal();
}

// 「保存」を押したとき
function handleSave(event) {
  event.preventDefault();

  const word = editForm.elements.word.value.trim();
  const meaning = editForm.elements.meaning.value.trim();
  const example = editForm.elements.example.value.trim();

  if (!word || !meaning) {
    editMessage.textContent = '英単語と意味は必須です';
    return;
  }
  if (hasWord(word, editingId)) {
    editMessage.textContent = `「${word}」はすでに登録されています`;
    return;
  }

  try {
    updateCard(editingId, { word, meaning, example });
  } catch (error) {
    console.error(error);
    editMessage.textContent = '保存に失敗しました';
    return;
  }

  dialog.close();
  renderList();
}

// 「この単語を削除」を押したとき
function handleDelete() {
  const card = findCard(editingId);
  if (!card) return;
  if (!confirm(`「${card.word}」を削除しますか？\n学習の記録も消えます。`)) return;

  try {
    deleteCard(card.id);
  } catch (error) {
    console.error(error);
    editMessage.textContent = '削除に失敗しました';
    return;
  }

  dialog.close();
  renderList();
}
