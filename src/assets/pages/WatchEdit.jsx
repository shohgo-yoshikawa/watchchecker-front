import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";

function WatchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  //編集フォームの入力内容
  const [formData, setFormData] = useState({
    brandId: "",
    modelName: "",
    modelNumber: "",
    driveType: "",
    lastUsedAt: "",
    lastMaintenanceAt: "",
    batteryUpdatedAt: "",
    memo: "",
  });

  //ブランド一覧
  const [brands, setBrands] = useState([]);

  //エラーメッセージ
  const [errorMessage, setErrorMessage] = useState("");

  //画面表示時にブランド一覧と時計情報を取得
  useEffect(() => {
    //ブランド一覧を取得
    axios
      .get("http://localhost:8080/api/brands")
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => {
        console.error("ブランド一覧の取得に失敗しました", error);
      });

    //編集対象の時計情報を取得
    axios
      .get(`http://localhost:8080/api/watches/${id}`)
      .then((response) => {
        const watch = response.data;

        setFormData({
          brandId: String(watch.brandId),
          modelName: watch.modelName || "",
          modelNumber: watch.modelNumber || "",
          driveType: watch.driveType || "",
          lastUsedAt: watch.lastUsedAt || "",
          lastMaintenanceAt: watch.lastMaintenanceAt || "",
          batteryUpdatedAt: watch.batteryUpdatedAt || "",
          memo: watch.memo || "",
        });
      })
      .catch((error) => {
        console.error("時計情報の取得に失敗しました", error);
      });
  }, [id]);

  //時計情報の更新
  const handleSubmit = async (event) => {
    //フォーム送信による画面の再読み込みを防ぐ
    event.preventDefault();
    //前回のエラーメッセージを消す
    setErrorMessage("");

    //必須項目の入力チェック
    if (!formData.brandId || !formData.modelName.trim()) {
      alert("ブランドとモデル名は必須です。");
      return;
    }

    //空の日付はnullにする
    const watchData = {
      ...formData,
      brandId: Number(formData.brandId),
      lastUsedAt: formData.lastUsedAt || null,
      lastMaintenanceAt: formData.lastMaintenanceAt || null,
      batteryUpdatedAt: formData.batteryUpdatedAt || null,
    };

    try {
      //Spring Bootに時計情報を送信
      await axios.put(`http://localhost:8080/api/watches/${id}`, watchData);

      //更新成功後、時計詳細画面へ移動
      navigate(`/watches/${id}`);
    } catch (error) {
      console.error("時計の更新に失敗しました", error);
      setErrorMessage("時計の更新に失敗しました。入力内容を確認してください。");
    }
  };

  return (
    <Container className="py-4">
      <Link to={`/watches/${id}`} className="btn btn-outline-dark mb-3">
        ←時計詳細に戻る
      </Link>

      <h1 className="mb-4">時計の編集</h1>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>ブランド</Form.Label>
          <Form.Select
            value={formData.brandId}
            onChange={(event) =>
              setFormData({ ...formData, brandId: event.target.value })
            }
          >
            <option value="">選択してください</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.brandName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>モデル名</Form.Label>
          <Form.Control
            type="text"
            value={formData.modelName}
            onChange={(event) =>
              setFormData({ ...formData, modelName: event.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>型番</Form.Label>
          <Form.Control
            type="text"
            value={formData.modelNumber}
            onChange={(event) =>
              setFormData({ ...formData, modelNumber: event.target.value })
            }
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>駆動方式</Form.Label>
          <Form.Select
            value={formData.driveType}
            onChange={(event) =>
              setFormData({ ...formData, driveType: event.target.value })
            }
          >
            <option value="">選択してください</option>
            <option value="自動巻き">自動巻き</option>
            <option value="手巻き">手巻き</option>
            <option value="クォーツ">クォーツ</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>最終稼働日</Form.Label>
          <Form.Control
            type="date"
            value={formData.lastUsedAt}
            onChange={(event) =>
              setFormData({ ...formData, lastUsedAt: event.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>最終メンテナンス日</Form.Label>
          <Form.Control
            type="date"
            value={formData.lastMaintenanceAt}
            onChange={(event) =>
              setFormData({
                ...formData,
                lastMaintenanceAt: event.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>電池交換日</Form.Label>
          <Form.Control
            type="date"
            value={formData.batteryUpdatedAt}
            onChange={(event) =>
              setFormData({ ...formData, batteryUpdatedAt: event.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>メモ</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.memo}
            onChange={(event) =>
              setFormData({ ...formData, memo: event.target.value })
            }
          />
        </Form.Group>
        <Button variant="dark" type="submit">
          変更を保存
        </Button>
      </Form>
    </Container>
  );
}

export default WatchEdit;
