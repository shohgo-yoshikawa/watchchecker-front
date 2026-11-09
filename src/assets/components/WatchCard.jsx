import { Card, Button, Badge } from "react-bootstrap";
// import Badge from "../../../node_modules/react-bootstrap/esm/Badge";

function WatchCard({ watch }) {
  //   const isQuartz = watch.movement === "クォーツ";
  const isQuartz = watch.driveType === "クォーツ";

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
                : `${watch.daysSinceLastRun}日前稼働`}
              {/* {isQuartz ? "稼働記録なし" : `${watch.daysSinceLastRun}日前稼働`} */}
            </small>
          </div>
        </div>

        {isQuartz ? (
          <Button variant="outline-secondary" className="watch-button" disabled>
            電池駆動
          </Button>
        ) : (
          <Button variant="dark" className="watch-button">
            ↻<small>稼働</small>
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default WatchCard;
