import { Col, Container, Form, Row } from "react-bootstrap";
// import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import WatchCard from "../components/WatchCard";
import { useEffect, useState } from "react";
import axios from "axios";
// import { Link } from "react-router-dom";
import WatchCreate from "./WatchCreate";
import { useNavigate } from "react-router-dom";

function WatchList() {
  const navigate = useNavigate();

  // ログアウト処理
  const handleLogout = async () => {
    try {
      // Spring BootのログアウトAPIを呼び出す
      await axios.post("/api/auth/logout");

      // ログイン画面に移動
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("ログアウトに失敗しました", error);
      window.alert("ログアウトに失敗しました。もう一度お試しください。");
    }
  };

  //時計データを保存する場所
  const [watches, setWatches] = useState([]);
  //検索キーワードを保存する場所
  const [keyword, setKeyword] = useState("");
  // 新規登録モーダルの表示状態
  const [showCreate, setShowCreate] = useState(false);

  // 稼働アラートのON/OFF状態
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(() => {
    return localStorage.getItem("watchAlarmEnabled") !== "false";
  });

  //画面が表示された時にAPIからデータを取得
  const fetchWatches = () => {
    // useEffect(() => {
    axios
      .get("/api/watches")
      .then((response) => {
        setWatches(response.data);
      })
      .catch((error) => {
        console.error("時計データの取得に失敗しました", error);
      });
  };

  useEffect(() => {
    fetchWatches();
  }, []);

  // アラート設定をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("watchAlarmEnabled", isAlarmEnabled);
  }, [isAlarmEnabled]);

  //稼働管理の対象となる時計の本数
  const managedCount = watches.filter(
    (watch) => watch.driveType === "自動巻き" || watch.driveType === "手巻き",
  ).length;

  //検索キーワードに一致する時計だけを抽出
  const filteredWatches = watches.filter((watch) => {
    const searchText = keyword.toLowerCase();

    return (
      (watch.brandName ?? "").toLowerCase().includes(searchText) ||
      (watch.modelName ?? "").toLowerCase().includes(searchText) ||
      (watch.modelNumber ?? "").toLowerCase().includes(searchText)
    );
  });

  return (
    <Container fluid className="watch-list-page">
      {/* ヘッダー */}
      <header className="watch-list-header">
        <span className="watch-list-logo">◉ WATCHCHECKER</span>

        <button
          type="button"
          className="watch-logout-button"
          onClick={handleLogout}
        >
          ログアウト
        </button>
      </header>
      {/* コレクションの見出し */}
      <div className="watch-list-heading">
        <div>
          <h1>コレクション</h1>
          <p className="watch-list-summary">
            {watches.length}本 ・ 稼働管理 {managedCount}本
          </p>
        </div>

        {/* 右側の設定エリア */}
        <div className="watch-list-tools">
          {/* 稼働アラートのON/OFF */}
          <div className="watch-alarm-setting">
            <div className="watch-alarm-setting-text">
              <span>稼働アラート</span>
              <small>30日以上稼働していない時計を通知</small>
            </div>
            <Form.Check
              type="switch"
              id="watch-alarm-toggle"
              checked={isAlarmEnabled}
              onChange={(event) => setIsAlarmEnabled(event.target.checked)}
              aria
            />
          </div>
          {/* 時計の検索 */}
          <Form.Control
            type="text"
            placeholder="ブランド名・モデル名・型番で検索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="watch-search"
            area-label="時計を検索"
          />
        </div>
      </div>
      {/* 時計カード一覧 */}
      {filteredWatches.length === 0 ? (
        <p className="watch-list-empty">該当する時計がありません。</p>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {filteredWatches.map((watch) => (
            <Col key={watch.id}>
              <WatchCard
                watch={watch}
                onUse={fetchWatches}
                isAlarmEnabled={isAlarmEnabled}
              />
            </Col>
          ))}
        </Row>
      )}
      {/* 新規登録ボタン */}

      <button
        type="button"
        className="watch-add-button"
        onClick={() => setShowCreate(true)}
        area-label="時計を新規登録"
      >
        +
      </button>

      {/* 新規登録モーダル */}
      <WatchCreate
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={fetchWatches}
      />
    </Container>

    // <Container className="py-4">
    //   <h1 className="mb-4">時計一覧</h1>
    //   <div className="mb-3">
    //     <Link to="/watches/new" className="btn btn-dark">
    //       + 時計を登録する
    //     </Link>
    //   </div>
    //   <Form.Control
    //     type="text"
    //     placeholder="ブランド名・モデル名・型番で検索"
    //     value={keyword}
    //     onChange={(event) => setKeyword(event.target.value)}
    //     className="mb-4"
    //     style={{
    //       maxWidth: "420px",
    //       borderRadius: "8px",
    //       border: "1px solid #ddd",
    //       padding: "10px 14px",
    //       backgroundColor: "#fff",
    //     }}
    //   />

    //   {filteredWatches.length === 0 ? (
    //     <p className="text-secondary">該当する時計がありません。</p>
    //   ) : (
    //     <Row xs={1} sm={2} lg={3} className="g-3">
    //       {/* {watches.map((watch) => ( */}
    //       {filteredWatches.map((watch) => (
    //         <Col key={watch.id}>
    //           {/* <WatchCard watch={watch} /> */}
    //           <WatchCard watch={watch} onUse={fetchWatches} />
    //         </Col>
    //       ))}
    //     </Row>
    //   )}
    // </Container>
  );
}

//仮の時計データ
//   const watches = [
//     {
//       id: 1,
//       brand: "CARTIER",
//       model: "Pasha",
//       movement: "自動巻き",
//       daysSinceLastRun: 38,
//     },
//     {
//       id: 2,
//       brand: "CARTIER",
//       model: "Pasha",
//       movement: "自動巻き",
//       daysSinceLastRun: 38,
//     },
//     {
//       id: 3,
//       brand: "SEIKO",
//       model: "5 Sports",
//       movement: "自動巻き",
//       daysSinceLastRun: 38,
//     },
//     {
//       id: 3,
//       brand: "SEIKO",
//       model: "5 Sports",
//       movement: "自動巻き",
//       daysSinceLastRun: 38,
//     },
//     {
//       id: 4,
//       brand: "RADO",
//       model: "QuartzWatch",
//       movement: "クォーツ",
//       daysSinceLastRun: null,
//     },
//     {
//       id: 5,
//       brand: "CYMA",
//       model: "Cymaflex",
//       movement: "手巻き",
//       daysSinceLastRun: 96,
//     },
//     {
//       id: 6,
//       brand: "CITIZEN",
//       model: "Seven Star V2",
//       movement: "自動巻き",
//       daysSinceLastRun: 46,
//     },
//   ];

//   return (
//     <Container className="py-4">
//       <h1 className="mb-4">時計一覧</h1>

//       <Row xs={1} sm={2} lg={3} className="g-3">
//         {watches.map((watch) => (
//           <Col key={watch.id}>
//             <WatchCard watch={watch} />
//           </Col>
//         ))}
//       </Row>
//     </Container>

//     );
// }

export default WatchList;
