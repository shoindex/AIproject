import { useEffect, useState } from 'react';

function App() {
  const [pingResult, setPingResult] = useState('読み込み中...');

  useEffect(() => {
    fetch('http://localhost:8080/api/ping')
      .then((res) => res.text())
      .then((text) => setPingResult(text))
      .catch(() => setPingResult('バックエンドに接続できませんでした'));
  }, []);

  return (
    <div>
      <h1>Trello風タスク管理アプリ</h1>
      <p>バックエンドからの応答: {pingResult}</p>
    </div>
  );
}

export default App;
