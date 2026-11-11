// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import WatchList from "./assets/pages/WatchList";
import WatchDetail from "./assets/pages/WatchDetail";
import WatchCreate from "./assets/pages/WatchCreate";
import WatchEdit from "./assets/pages/WatchEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/watches" replace />} />
        <Route path="/watches" element={<WatchList />} />
        <Route path="/watches/:id" element={<WatchDetail />} />
        <Route path="/watches/new" element={<WatchCreate />} />
        <Route path="/watches/:id/edit" element={<WatchEdit />} />
      </Routes>
    </BrowserRouter>
  );
  //// return <WatchList />;

  // return (
  //   <div>
  //     <h1>Watch Checker</h1>
  //     <p>腕時計管理システム</p>
  //   </div>
  // );
}

export default App;
