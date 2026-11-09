import { Col, Container, Row } from "react-bootstrap";
import WatchCard from "../components/WatchCard";
import { useEffect, useState } from "react";
import axios from "axios";

function WatchList() {
  //時計データを保存する場所
  const [watches, setWatches] = useState([]);

  //画面が表示された時にAPIからデータを取得
  const fetchWatches = () => {
    // useEffect(() => {
    axios
      .get("http://localhost:8080/api/watches")
      .then((response) => {
        // console.log("API取得成功:", response.data);
        console.log(response.data);
        setWatches(response.data);
      })
      .catch((error) => {
        console.error("時計データの取得に失敗しました", error);
      });
  };
  // }, []);

  useEffect(() => {
    fetchWatches();
  }, []);

  return (
    <Container className="py-4">
      <h1 className="mb-4">時計一覧</h1>
      <Row xs={1} sm={2} lg={3} className="g-3">
        {watches.map((watch) => (
          <Col key={watch.id}>
            {/* <WatchCard watch={watch} /> */}
            <WatchCard watch={watch} onUse={fetchWatches} />
          </Col>
        ))}
      </Row>
    </Container>
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
