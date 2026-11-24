import axios from "axios";
import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import Badge from "../../../node_modules/react-bootstrap/esm/Badge";

// function WatchCard({ watch }) {
function WatchCard({ watch, onUse, isAlarmEnabled }) {
  const navigate = useNavigate();
  //詳細画面へ移動
  const handleDetail = () => {
    navigate(`/watches/${watch.id}`);
  };

  //   const isQuartz = watch.movement === "クォーツ";
  const isQuartz = watch.driveType === "クォーツ";

  // 30日以上稼働していない時計かどうか
  const showAlarm =
    isAlarmEnabled &&
    !isQuartz &&
    typeof watch.daysSinceLastUsed === "number" &&
    watch.daysSinceLastUsed >= 30;

  // 今日の日付を取得
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // 最終稼働日が今日かどうか判定
  const isUsedToday =
    (watch.lastUsedAt &&
      String(watch.lastUsedAt).slice(0, 10) === todayString) ||
    watch.daysSinceLastUsed === 0;

  //稼働を記録する処理
  const handleUse = async () => {
    try {
      await axios.post(`/api/watches/${watch.id}/use`);
      //登録成功後に親コンポーネントへ通知
      onUse();
    } catch (error) {
      console.error("稼働記録に失敗しました", error);
      alert("稼働記録に失敗しました。もう一度お試しください。");
    }
  };

  //最終稼働日の表示文字を決める
  const getLastUsedText = () => {
    if (isQuartz) {
      return "稼働記録対象外";
    }
    if (watch.daysSinceLastUsed === -1) {
      return "稼働記録なし";
    }
    if (watch.daysSinceLastUsed === 0) {
      return "今日 稼働";
    }

    return `${watch.daysSinceLastUsed}日前 稼働`;
  };

  return (
    // <Card className="watch-card" onClick={handleDetail}>
    <Card
      className={`watch-card ${showAlarm ? "watch-card-alarm" : ""}`}
      onClick={handleDetail}
    >
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div className="watch-card-info">
          <div className="watch-brand">{watch.brandName}</div>

          <Card.Title className="watch-model">{watch.modelName}</Card.Title>
          {/* ここから次 */}

          <div className="watch-card-status-row">
            <Badge bg="light" text="dark" className="watch-drive-badge">
              {watch.driveType || "未設定"}
            </Badge>

            {showAlarm ? (
              <span className="watch-alarm-badge">
                <svg
                  className="watch-alarm-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
                最終稼働から{watch.daysSinceLastUsed}日経過
              </span>
            ) : (
              <small className="text-secondary watch-last-used">
                {getLastUsedText()}
              </small>
            )}
          </div>
        </div>

        {isQuartz ? (
          <Button
            variant="outline-secondary"
            className="watch-button watch-quartz-button"
            disabled
          >
            <span>電池</span>
            <span>駆動</span>
          </Button>
        ) : (
          <Button
            variant="dark"
            className="watch-button"
            disabled={isUsedToday}
            onClick={(event) => {
              event.stopPropagation();
              handleUse();
            }}
          >
            {isUsedToday ? (
              <>
                <span className="watch-refresh-icon">✓</span>
              </>
            ) : (
              <>
                <span className="watch-refresh-icon">↻</span>
                <small>稼働</small>
              </>
            )}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default WatchCard;
