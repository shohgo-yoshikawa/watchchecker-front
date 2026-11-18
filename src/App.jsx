// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import WatchList from "./assets/pages/WatchList";
import WatchDetail from "./assets/pages/WatchDetail";
// import WatchCreate from "./assets/pages/WatchCreate";
import WatchEdit from "./assets/pages/WatchEdit";
import Login from "./assets/pages/Login";
import RequireAuth from "./assets/components/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* トップページ */}
        <Route path="/" element={<Navigate to="/watches" replace />} />

        {/* ログイン画面:認証不要 */}
        <Route path="/login" element={<Login />} />

        {/* 以下はログインが必要な画面 */}
        <Route element={<RequireAuth />}>
          <Route path="/watches" element={<WatchList />} />
          <Route path="/watches/:id" element={<WatchDetail />} />
          {/* <Route path="/watches/new" element={<WatchCreate />} /> */}
          <Route path="/watches/:id/edit" element={<WatchEdit />} />
        </Route>
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
