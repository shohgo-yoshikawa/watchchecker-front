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

    // MySQLに保存されている市場価格を取得
    axios
      .get(`http://localhost:8080/api/market/chrono24/${id}/history`)
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

  // 中古市場価格を取得する
  const handleFetchMarketPrice = async () => {
    if (!watch.modelNumber) {
      setMarketError("時計の型番が登録されていません。");
      return;
    }

    setIsLoadingMarket(true);
    setMarketError("");

    try {
      // Spring Bootの価格取得APIを呼び出す
      const response = await axios.get(
        `http://localhost:8080/api/market/chrono24/${id}/${encodeURIComponent(watch.modelNumber)}`,
      );

      // 取得した価格データを保存
      setMarketData(response.data);
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

        {marketData?.medianPriceJpy != null ? (
          <>
            <div className="watch-market-summary">
              <div className="watch-market-main">
                {/* 出品件数に応じて表示名を変更 */}
                <span className="watch-market-label">
                  {marketData.listingCount === 1
                    ? "中古価格の参考価格"
                    : "中古価格の参考中央値"}
                </span>

                {/* 日本円の価格 */}
                <strong className="watch-market-price">
                  {new Intl.NumberFormat("ja-JP", {
                    style: "currency",
                    currency: "JPY",
                    maximumFractionDigits: 0,
                  }).format(marketData.medianPriceJpy)}
                </strong>

                {/* 出品件数 */}
                <span className="watch-market-count">
                  出品件数：{marketData.listingCount}件
                </span>
              </div>

              {/* 前回取得価格との差 */}
              {marketData.priceDifferenceJpy != null && (
                <span
                  className={`watch-market-change ${marketData.priceChange.toLowerCase()}`}
                >
                  {marketData.priceDifferenceJpy > 0
                    ? `+${new Intl.NumberFormat("ja-JP").format(marketData.priceDifferenceJpy)}円`
                    : marketData.priceDifferenceJpy < 0
                      ? `−${new Intl.NumberFormat("ja-JP").format(Math.abs(marketData.priceDifferenceJpy))}円`
                      : "±0円"}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="watch-detail-market">
            中古相場はまだ取得されていません
          </div>
        )}

        {marketError && <p className="text-danger mt-2">{marketError}</p>}

        <div className="watch-market-footer">
          {/* 取得元に応じて表示を変更 */}
          <span>
            参考：
            {marketData?.source === "Chrono24 Global"
              ? "Chrono24（海外出品を含む）"
              : marketData?.source === "Chrono24 JP"
                ? "Chrono24（国内出品）"
                : "Chrono24"}
          </span>

          <Button
            variant="outline-dark"
            className="watch-market-button"
            onClick={handleFetchMarketPrice}
            disabled={isLoadingMarket || !watch.modelNumber}
          >
            {isLoadingMarket ? "更新中..." : "相場を更新"}
          </Button>
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
