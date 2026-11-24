import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function RequireAuth() {
  //ログイン情報の確認状況
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    //Spring Bootにログイン状態を確認する
    axios
      .get("/api/auth/me")
      .then(() => {
        if (isMounted) {
          setAuthStatus("authenticated");
        }
      })
      .catch((error) => {
        if (!isMounted) return;

        if (error.response?.status === 401) {
          //ログインしていない場合
          setAuthStatus("unauthenticated");
        } else {
          //通信エラーの場合
          console.error("ログイン状態の確認に失敗しました", error);
          setAuthStatus("error");
        }
      });

    //コンポーネントが画面から消えた場合の処理
    return () => {
      isMounted = false;
    };
  }, []);

  //ログイン状態を確認している間
  if (authStatus === "checking") {
    return <p>ログイン状態を確認しています...</p>;
  }

  //未ログインならログイン画面へ移動
  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  //通信エラーの場合
  if (authStatus === "error") {
    return (
      <p>ログイン状態を確認できません。サーバーの状態を確認してください。</p>
    );
  }

  //ログイン済みなら子画面を表示
  return <Outlet />;
}

export default RequireAuth;
