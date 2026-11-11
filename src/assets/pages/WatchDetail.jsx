import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function WatchDetail() {
  //URLから時計IDを取得
  const { id } = useParams();
  const navigate = useNavigate();

  //時計データを保存する場所
  const [watch, setWatch] = useState(null);

  //APIから時計の詳細データを取得
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/watches/${id}`)
      .then((response) => {
        console.log(response.data);
        setWatch(response.data);
      })
      .catch((error) => {
        console.error("時計情報の取得に失敗しました", error);
      });
  }, [id]);

  //時計の削除
  const handleDelete = async () => {
    //削除してよいか確認
    const result = window.confirm("この時計を削除してもよろしいですか？");

    //キャンセルされた場合は何もしない
    if (!result) {
      return;
    }

    try {
      //Spring Bootの削除APIを呼び出す
      await axios.delete(`http://localhost:8080/api/watches/${id}`);

      //削除成功後、時計画面へ移動
      navigate("/watches");
    } catch (error) {
      console.error("時計の削除に失敗しました", error);
      alert("時計の削除に失敗しました");
    }
  };

  return (
    <div>
      <Link to="/watches" className="btm btm-outline-dark mb-3">
        ← 時計一覧に戻る
      </Link>
      <h1>時計詳細</h1>
      {/* <p>時計ID:{id}</p> */}

      {watch === null ? (
        <p>読み込み中...</p>
      ) : (
        <div>
          <p>ブランド名:{watch.brandName}</p>
          <Link
            to={`/watches/${id}/edit`}
            className="btn btn-outline-dark mb-3"
          >
            時計を編集する
          </Link>
          <button className="btn btn-danger mb-3 ms-2" onClick={handleDelete}>
            時計を削除する
          </button>
          <p>モデル名:{watch.modelName}</p>
          <p>型番:{watch.modelNumber}</p>
          <p>駆動方式:{watch.driveType}</p>
          <p>最終稼働日:{watch.lastUsedAt}</p>
          <p>最終メンテナンスビ:{watch.lastMaintenanceAt}</p>
          <p>電池交換日:{watch.batteryUpdatedAt ?? "未登録"}</p>
          <p>メモ:{watch.memo}</p>
        </div>
      )}
    </div>
  );
}

export default WatchDetail;
