import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function WatchCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // brandName: "",
    brandId: "",
    modelName: "",
    modelNumber: "",
    driveType: "",
    lastUsedAt: "",
    lastMaintenanceAt: "",
    batteryUpdatedAt: "",
    memo: "",
  });
  //ブランド名を保存するstate
  const [brands, setBrands] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  //画面表示時にブランド一覧を取得
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/brands")
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => {
        console.error("ブランド一覧の取得に失敗しました", error);
      });
  }, []);

  //時計の新規登録
  const handleSubmit = async (event) => {
    //フォーム送信による画面の再読み込みを防ぐ
    event.preventDefault();
    //前回のエラーエッセージを消す
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
      await axios.post("http://localhost:8080/api/watches", watchData);
      //登録成功後、時計一覧画面へ移動
      navigate("/watches");
    } catch (error) {
      console.error("時計の登録に失敗しました", error);
      setErrorMessage("時計の登録に失敗しました。入力内容を確認してください。");
    }
  };

  return (
    <Container className="py-4">
      <Link to="/watches" className="btn btn-outline-dark mb-3">
        ←時計一覧に戻る
      </Link>
      <h1 className="mb-4">時計の新規登録</h1>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            ブランド<span className="text-danger">必須</span>
          </Form.Label>
          <Form.Select
            required
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
          <Form.Label>
            モデル名<span className="text-danger">必須</span>
          </Form.Label>
          <Form.Control
            type="text"
            required
            placeholder="例:Tank Must"
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
            placeholder="例:WSTA0041"
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
              setFormData({
                ...formData,
                driveType: event.target.value,
              })
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

        <Form.Group className="mb-4">
          <Form.Label>メモ</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="時計についてのメモ"
            value={formData.memo}
            onChange={(event) =>
              setFormData({
                ...formData,
                memo: event.target.value,
              })
            }
          />
        </Form.Group>

        <Button variant="dark" type="submit">
          登録する
        </Button>
      </Form>
    </Container>
    // <div>

    //   <Link to="/Watchesdd">← 時計一覧に戻る</Link>
    //   <h1>時計の新規登録</h1>
    //   <p>ここに登録フォームを作成します</p>
    // </div>
  );
}

export default WatchCreate;
