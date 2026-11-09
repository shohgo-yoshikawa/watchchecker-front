import axios from "axios";
import { Card, Button, Badge } from "react-bootstrap";
// import Badge from "../../../node_modules/react-bootstrap/esm/Badge";

// function WatchCard({ watch }) {
function WatchCard({ watch, onUse }) {
  //   const isQuartz = watch.movement === "クォーツ";
  const isQuartz = watch.driveType === "クォーツ";

  //稼働を記録する処理
  const handleUse = async () => {
    try {
      await axios.post(`http://localhost:8080/api/watches/${watch.id}/use`);
      //登録成功後に親コンポーネントへ通知
      onUse();
    } catch (error) {
      console.error("稼働記録に失敗しました", error);
      alert("稼働記録に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <Card className="watch-card">
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          {/* <div className="watch-brand">{watch.brand}</div> */}
          <div className="watch-brand">{watch.brandName}</div>
          {/* <Card.Title>{watch.model}</Card.Title> */}
          <Card.Title>{watch.modelName}</Card.Title>

          <div className="d-flex align-items-center gap-2">
            <Badge bg="light" text="dark" className="border">
              {watch.movement}
            </Badge>

            <small className="text-secondary">
              {watch.daysSinseLastUsed === -1
                ? "稼働記録なし"
                : `${watch.daysSinceLastUsed}日前稼働`}
              {/* {isQuartz ? "稼働記録なし" : `${watch.daysSinceLastRun}日前稼働`} */}
            </small>
          </div>
        </div>

        {isQuartz ? (
          <Button variant="outline-secondary" className="watch-button" disabled>
            電池駆動
          </Button>
        ) : (
          // <Button variant="dark" className="watch-button">
          <Button variant="dark" className="watch-button" onClick={handleUse}>
            ↻<small>稼働</small>
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default WatchCard;
