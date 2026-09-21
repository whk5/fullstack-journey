const output = document.getElementById('output');

document.getElementById('load').addEventListener('click', async () => {
  output.textContent = '加载中…';
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = `失败：${err.message}`;
  }
});
