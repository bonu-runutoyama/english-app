// 「追加」画面：1語ずつ単語を登録する

import { addCard, getCards, hasWord } from './storage.js';

// 画面の初期化（起動時に1回だけ呼ぶ）
export function initAddView() {
  const form = document.getElementById('add-form');
  const message = document.getElementById('add-message');

  // メッセージを表示する（isError が true なら赤字）
  function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle('is-error', isError);
  }

  form.addEventListener('submit', (event) => {
    // フォーム送信によるページ遷移を止める
    event.preventDefault();

    const word = form.elements.word.value.trim();
    const meaning = form.elements.meaning.value.trim();
    const example = form.elements.example.value.trim();

    if (!word || !meaning) {
      showMessage('英単語と意味は必須です', true);
      return;
    }
    if (hasWord(word)) {
      showMessage(`「${word}」はすでに登録されています`, true);
      return;
    }

    try {
      addCard({ word, meaning, example });
    } catch (error) {
      console.error(error);
      showMessage('保存に失敗しました（容量不足の可能性があります）', true);
      return;
    }

    showMessage(`「${word}」を追加しました（全${getCards().length}語）`);
    form.reset();
    // 続けて入力できるよう、英単語の欄に戻る
    form.elements.word.focus();
  });
}
