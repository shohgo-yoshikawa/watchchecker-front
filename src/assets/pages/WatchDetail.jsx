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

  // 中古市場価格のデータ
  const [marketData, setMarketData] = useState(null);

  //中古価格を取得中かどうか
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  //市場価格取得時のエラーメッセージ
  const [marketError, setMarketError] = useState("");

  // 稼働アラートのON/OFF設定を読み込む
  const [isAlarmEnabled] = useState(() => {
    return localStorage.getItem("watchAlarmEnabled") !== "false";
  });

  // 時計の詳細情報を再取得
  const fetchWatch = useCallback(async () => {
    try {
      const response = await axios.get(`/api/watches/${id}`);

      setWatch(response.data);
    } catch (error) {
      console.error("時計情報の取得に失敗しました", error);
    }
  }, [id]);

  // 画面表示時に時計情報を取得
  useEffect(() => {
    let isMounted = true;

    axios
      .get(`/api/watches/${id}`)
      .then((response) => {
        if (isMounted) {
          setWatch(response.data);
        }
      })
      .catch((error) => {
        console.error("時計情報の取得に失敗しました", error);
      });

    // MySQLに保存されている市場価格を取得
    axios
      .get(`/api/market/chrono24/${id}/history`)
      .then((response) => {
        if (isMounted) {
          if (response.data.priceChange === "NO_DATA") {
            setMarketData(null);
          } else {
            setMarketData(response.data);
          }
        }
      })
      .catch((error) => {
        console.error("市場価格の取得に失敗しました", error);
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

  // 相場取得日を YYYY.MM.DD 形式に整える
  const formatMarketDate = (date) => {
    if (!date) return "";

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
      await axios.post(`/api/watches/${id}/use`);

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
      await axios.delete(`/api/watches/${id}`);

      navigate("/watches");
    } catch (error) {
      console.error("時計の削除に失敗しました", error);
      alert("時計の削除に失敗しました");
    }
  };

  // 中古市場価格を取得する
  const handleFetchMarketPrice = async () => {
    if (!watch.modelNumber) {
      setMarketError("時計の型番が登録されていません。");
      return;
    }

    setIsLoadingMarket(true);
    setMarketError("");

    try {
      // ① Chrono24から最新の相場を取得してMySQLに保存
      const response = await axios.get(
        `/api/market/chrono24/${id}/${encodeURIComponent(watch.modelNumber)}`,
      );

      // ② MySQLから保存した最新の履歴を再取得
      try {
        const historyResponse = await axios.get(
          `/api/market/chrono24/${id}/history`,
        );

        // 履歴に保存された最新データを画面に反映
        setMarketData(historyResponse.data);
      } catch (historyError) {
        // 履歴の取得に失敗した場合は、最初のAPI応答を使用
        console.error("市場価格履歴の取得に失敗しました", historyError);
        setMarketData(response.data);
      }
    } catch (error) {
      console.error("市場価格の取得に失敗しました", error);

      setMarketError(
        "市場価格を取得できませんでした。時間をおいて再度お試しください。",
      );
    } finally {
      setIsLoadingMarket(false);
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

  // 稼働アラートを表示するか判定
  const showAlarm =
    isAlarmEnabled &&
    !isQuartz &&
    typeof watch.daysSinceLastUsed === "number" &&
    watch.daysSinceLastUsed >= 30;

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
        {/* 30日以上未稼働の場合のアラート */}
        {showAlarm && (
          <div className="watch-detail-alarm">
            <svg
              className="watch-detail-alarm-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            <span>最終稼働から{watch.daysSinceLastUsed}日経過</span>
          </div>
        )}
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

      {/* 中古相場 */}
      <section className="watch-detail-section watch-market-section">
        {/* 見出しと更新ボタン */}
        <div className="watch-market-heading">
          <h2>中古相場</h2>

          <button
            type="button"
            className="watch-market-refresh"
            onClick={handleFetchMarketPrice}
            disabled={isLoadingMarket || !watch.modelNumber}
          >
            <span>↻</span>
            {isLoadingMarket ? "取得中..." : "相場を更新"}
          </button>
        </div>

        {/* 相場データ */}
        <div className="watch-market-card">
          {marketData?.medianPriceJpy != null ? (
            <>
              {/* 価格と前回比 */}
              <div className="watch-market-card-main">
                <span className="watch-market-label">
                  {marketData.listingCount === 1
                    ? "中古価格の参考価格"
                    : "中古価格の参考中央値"}
                </span>

                <div className="watch-market-price-area">
                  <strong className="watch-market-price">
                    {new Intl.NumberFormat("ja-JP", {
                      style: "currency",
                      currency: "JPY",
                      maximumFractionDigits: 0,
                    }).format(marketData.medianPriceJpy)}
                  </strong>

                  {marketData.priceDifferenceJpy != null && (
                    <span className="watch-market-change">
                      前回比{" "}
                      {marketData.priceDifferenceJpy > 0
                        ? `+¥${new Intl.NumberFormat("ja-JP").format(marketData.priceDifferenceJpy)}`
                        : marketData.priceDifferenceJpy < 0
                          ? `−¥${new Intl.NumberFormat("ja-JP").format(Math.abs(marketData.priceDifferenceJpy))}`
                          : "±¥0"}
                    </span>
                  )}
                </div>
              </div>

              {/* 出品件数・取得元・取得日 */}
              <div className="watch-market-meta">
                <span>出品件数 {marketData.listingCount}件</span>

                <span>・</span>

                <span>
                  参考：
                  {marketData.source === "Chrono24 Global"
                    ? "Chrono24（海外出品を含む）"
                    : marketData.source === "Chrono24 JP"
                      ? "Chrono24（国内出品）"
                      : "Chrono24"}
                </span>

                {marketData.fetchedAt && (
                  <>
                    <span>・</span>
                    <span>{formatMarketDate(marketData.fetchedAt)}取得</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="watch-market-empty">
              中古相場はまだ取得されていません
            </div>
          )}
        </div>

        {marketError && <p className="text-danger mt-2">{marketError}</p>}
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
