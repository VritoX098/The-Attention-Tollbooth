function fmt(ms) {
  if (ms <= 0) return '0s';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${r}s`;
}

async function render() {
  const data = await chrome.runtime.sendMessage({ type: 'GET_DASHBOARD' });
  if (!data) return;

  document.getElementById('fp').textContent = data.focusPoints;
  document.getElementById('tax').textContent = data.procrastinationTax;
  document.getElementById('daily').textContent = data.dailyFP;

  const streakEl = document.getElementById('streak');
  streakEl.textContent = data.streakDays > 0 ? `Streak ${data.streakDays}d` : '';

  const list = document.getElementById('tabList');
  const empty = document.getElementById('empty');
  list.innerHTML = '';
  if (!data.tabs.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const t of data.tabs) {
    const totalMs = t.allocatedMinutes * 60 * 1000;
    const remaining = Math.max(0, t.expiresAt - data.now);
    const pct = Math.max(0, Math.min(100, (remaining / totalMs) * 100));

document.getElementById('reset').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'RESET_ALL_TIMERS' });
  render();
});

render();
setInterval(render, 1000);
