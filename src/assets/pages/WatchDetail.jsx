import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import WatchEdit from "./WatchEdit";

function WatchDetail() {
  // URLから時計IDを取得
  const { id } = useParams();
  const navigate = useNavigate();

  // 時計データ
  const [watch, setWatch] = useState(null);

  // 編集モーダルの表示状態
  const [showEdit, setShowEdit] = useState(false);

  // 稼働記録中かどうか
  const [isUsing, setIsUsing] = useState(false);

  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState("");

  // 時計の詳細情報を再取得
  const fetchWatch = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/watches/${id}`,
      );

      setWatch(response.data);
    } catch (error) {
      console.error("時計情報の取得に失敗しました", error);
    }
  }, [id]);

  // 画面表示時に時計情報を取得
  useEffect(() => {
    let isMounted = true;

    axios
      .get(`http://localhost:8080/api/watches/${id}`)
      .then((response) => {
        if (isMounted) {
          setWatch(response.data);
        }
      })
      .catch((error) => {
        console.error("時計情報の取得に失敗しました", error);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 日付を YYYY.MM.DD 形式に整える
  const formatDate = (date) => {
    if (!date) return "未登録";

    return String(date).slice(0, 10).replaceAll("-", ".");
  };

  // 最終稼働状況の表示
  const getLastUsedText = () => {
    if (watch.driveType === "クォーツ") {
      return "稼働記録対象外";
    }

    if (watch.daysSinceLastUsed === -1 || !watch.lastUsedAt) {
      return "稼働記録なし";
    }

    if (watch.daysSinceLastUsed === 0) {
      return "今日 稼働";
    }

    if (typeof watch.daysSinceLastUsed === "number") {
      return `${watch.daysSinceLastUsed}日前 稼働`;
    }

    return `${formatDate(watch.lastUsedAt)} 稼働`;
  };

  // 稼働を記録する
  const handleUse = async () => {
    setIsUsing(true);
    setErrorMessage("");

    try {
      await axios.post(`http://localhost:8080/api/watches/${id}/use`);

      // 稼働記録後に詳細情報を再取得
      await fetchWatch();
    } catch (error) {
      console.error("稼働記録に失敗しました", error);
      setErrorMessage("稼働記録に失敗しました。もう一度お試しください。");
    } finally {
      setIsUsing(false);
    }
  };

  // 時計を削除する
  const handleDelete = async () => {
    const result = window.confirm("この時計を削除してもよろしいですか？");

    if (!result) return;

    try {
      await axios.delete(`http://localhost:8080/api/watches/${id}`);

      navigate("/watches");
    } catch (error) {
      console.error("時計の削除に失敗しました", error);
      alert("時計の削除に失敗しました");
    }
  };

  // 読み込み中
  if (watch === null) {
    return (
      <Container className="watch-detail-page">
        <Link to="/watches" className="watch-back-link">
          ← 一覧へ戻る
        </Link>
        <p>読み込み中...</p>
      </Container>
    );
  }

  const isQuartz = watch.driveType === "クォーツ";

  // 今日の日付を取得（ブラウザのローカル時間）
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // 最終稼働日が今日かどうか判定
  const isUsedToday =
    watch.lastUsedAt && String(watch.lastUsedAt).slice(0, 10) === todayString;

  return (
    <Container className="watch-detail-page">
      {/* 上部ナビゲーション */}
      <div className="watch-detail-top">
        <Link to="/watches" className="watch-back-link">
          ← 一覧へ戻る
        </Link>

        <Button
          variant="outline-dark"
          className="watch-detail-edit"
          onClick={() => setShowEdit(true)}
        >
          ✎ 編集
        </Button>
      </div>

      {/* 時計のタイトル */}
      <header className="watch-detail-heading">
        <div className="watch-brand">{watch.brandName}</div>

        <h1>{watch.modelName}</h1>

        <p className="watch-detail-status">{getLastUsedText()}</p>
      </header>

      {/* 稼働記録ボタン */}
      {isQuartz ? (
        <div className="watch-detail-quartz">電池駆動・稼働記録対象外</div>
      ) : (
        <Button
          variant="dark"
          className={`watch-detail-use-button ${isUsedToday ? "is-used" : ""}`}
          onClick={handleUse}
          disabled={isUsing || isUsedToday}
        >
          {isUsing ? (
            "記録中..."
          ) : isUsedToday ? (
            "✔︎ 今日の稼働を記録済み"
          ) : (
            <>
              <span className="watch-detail-use-icon">↻</span>
              稼働を記録する
            </>
          )}
        </Button>
      )}

      {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}

      {/* 時計の基本情報 */}
      <div className="watch-detail-info">
        <div className="watch-detail-row">
          <span>ブランド</span>
          <strong>{watch.brandName || "未登録"}</strong>
        </div>

        <div className="watch-detail-row">
          <span>モデル</span>
          <strong>{watch.modelName || "未登録"}</strong>
        </div>

        <div className="watch-detail-row">
          <span>駆動方式</span>
          <strong>{watch.driveType || "未登録"}</strong>
        </div>

        <div className="watch-detail-row">
          <span>型番</span>
          <strong>{watch.modelNumber || "未登録"}</strong>
        </div>

        <div className="watch-detail-row">
          <span>最終稼働日</span>
          <strong>{formatDate(watch.lastUsedAt)}</strong>
        </div>

        {isQuartz ? (
          <div className="watch-detail-row">
            <span>最終電池交換日</span>
            <strong>{formatDate(watch.batteryUpdatedAt)}</strong>
          </div>
        ) : (
          <div className="watch-detail-row">
            <span>最終メンテナンス日</span>
            <strong>{formatDate(watch.lastMaintenanceAt)}</strong>
          </div>
        )}
      </div>

      {/* 市場価格 */}
      <section className="watch-detail-section">
        <h2>市場価格</h2>

        <div className="watch-detail-market">
          <span>↗</span>
          相場データとの連携は準備中です
        </div>
      </section>

      {/* メモ */}
      <section className="watch-detail-section">
        <h2>メモ</h2>

        <div className="watch-detail-memo">
          {watch.memo || "メモはありません。"}
        </div>
      </section>

      {/* 時計の削除 */}
      <button
        type="button"
        className="watch-detail-delete"
        onClick={handleDelete}
      >
        この時計を削除
      </button>

      {/* 編集モーダル */}
      <WatchEdit
        id={id}
        show={showEdit}
        onHide={() => setShowEdit(false)}
        onUpdated={fetchWatch}
      />
    </Container>
  );
}

export default WatchDetail;
