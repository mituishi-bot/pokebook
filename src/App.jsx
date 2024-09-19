// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PokemonGetImg from "./PokemonGetImg.jsx";
import PokemonDetail from "./PokemonDetail.jsx"; // 詳細ページのコンポーネントをインポート

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PokemonGetImg />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
