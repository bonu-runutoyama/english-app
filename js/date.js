// 日付を扱う関数
// 日付はすべて端末のローカル時刻で "YYYY-MM-DD" の文字列にして扱う。
// （toISOString() はUTCになり、日本時間の朝9時前は前日の日付になってしまうため使わない）

// Date を "YYYY-MM-DD" にする
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 今日の日付 "YYYY-MM-DD"
export function today() {
  return formatDate(new Date());
}

// "YYYY-MM-DD" に日数を足した日付を返す（月末・年末の繰り上がりは Date に任せる）
export function addDays(dateString, days) {
  const [y, m, d] = dateString.split('-').map(Number);
  return formatDate(new Date(y, m - 1, d + days));
}
