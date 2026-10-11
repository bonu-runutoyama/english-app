// localStorage への保存・読み込みを担当する
// データの読み書きはすべてこのファイルを通して行う

import { today } from './date.js';

const STORAGE_KEY = 'english-app:v1';
// 読み込みに失敗したデータを退避しておくキー（上書きで消さないため）
const BROKEN_KEY = 'english-app:v1:broken';
const DATA_VERSION = 1;

// 読み込んだデータをメモリ上に持っておく（毎回 JSON を解析しないため）
let data = null;

// 空のデータを作る
function createEmptyData() {
  return {
    version: DATA_VERSION,
    cards: [],
    settings: { newPerDay: 20 },
    // 今日の出題の記録（新規カードの上限・「忘れた」の出し直しに使う。ステップ4で利用）
    today: { date: '', newIds: [], relearnIds: [] },
  };
}

// 保存されていたデータに足りない項目があれば初期値で補う
function normalize(saved) {
  const empty = createEmptyData();
  return {
    version: DATA_VERSION,
    cards: Array.isArray(saved.cards) ? saved.cards : [],
    settings: { ...empty.settings, ...saved.settings },
    today: { ...empty.today, ...saved.today },
  };
}

// データを読み込む（2回目以降はメモリ上のものを返す）
export function loadData() {
  if (data) return data;

  const text = localStorage.getItem(STORAGE_KEY);
  if (!text) {
    data = createEmptyData();
    return data;
  }

  try {
    data = normalize(JSON.parse(text));
  } catch (error) {
    // 壊れたデータは別のキーに退避してから、空の状態で始める
    console.error('データの読み込みに失敗しました', error);
    localStorage.setItem(BROKEN_KEY, text);
    alert('保存データが読み込めなかったため、空の状態で起動します。\n元のデータは退避してあります。');
    data = createEmptyData();
  }
  return data;
}

// 現在のデータを保存する。容量不足などで失敗したら例外を投げる
export function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadData()));
}

// 全カードの配列を返す
export function getCards() {
  return loadData().cards;
}

// 比較用に単語を整える（前後の空白を除き、小文字にする）
function normalizeWord(word) {
  return word.trim().toLowerCase();
}

// 同じ単語がすでに登録されているか（大文字・小文字は区別しない）
export function hasWord(word) {
  const target = normalizeWord(word);
  return getCards().some((card) => normalizeWord(card.word) === target);
}

// カードIDを作る
// crypto.randomUUID() は HTTPS でしか使えないため、HTTP でも使える
// crypto.getRandomValues() で8バイトの乱数を作り、現在時刻と組み合わせる
function createId() {
  const existing = new Set(getCards().map((card) => card.id));
  let id;
  do {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const random = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    id = `${Date.now().toString(36)}-${random}`;
  } while (existing.has(id)); // 念のため既存IDとの重複を確認
  return id;
}

// 新しいカードを作って追加・保存し、作ったカードを返す
export function addCard({ word, meaning, example }) {
  const now = Date.now();
  const card = {
    id: createId(),
    word: word.trim(),
    meaning: meaning.trim(),
    example: example.trim(),
    ease: 2.5, // 覚えやすさ係数
    interval: 0, // 次回までの日数
    reps: 0, // 続けて「覚えた」と答えた回数
    due: today(), // 次の出題日
    lastReviewed: null, // 最後に答えた日（null = まだ一度も答えていない新規カード）
    createdAt: now,
    updatedAt: now,
  };

  getCards().push(card);
  try {
    saveData();
  } catch (error) {
    // 保存できなかったらメモリ上からも取り消して、呼び出し元に知らせる
    getCards().pop();
    throw error;
  }
  return card;
}
