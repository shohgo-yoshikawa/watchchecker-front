import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
// import { Link, useNavigate } from "react-router-dom";

const initialFormData = {
  brandId: "",
  modelName: "",
  modelNumber: "",
  driveType: "自動巻き",
  lastMaintenanceAt: "",
  batteryUpdatedAt: "",
  memo: "",
};

function WatchCreate({ show, onHide, onCreated }) {
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState("");

  //モーダル表示時にブランド一覧を取得
  useEffect(() => {
    if (!show) return;

    axios
      .get("http://localhost:8080/api/brands")
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => {
        console.error("ブランド一覧の取得に失敗しました", error);
      });
  }, [show]);

  //必要項目がすべて入力されているか判定
  const isFormValid =
    Boolean(formData.brandId) &&
    formData.modelName.trim() !== "" &&
    formData.modelNumber.trim() !== "";

  //入力値を更新
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //モーダルを閉じる
  const handleClose = () => {
    setFormData(initialFormData);
    setErrorMessage("");
    onHide();
  };

  //時計を新規登録
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const watchData = {
      ...formData,
      brandId: Number(formData.brandId),
      lastUsedAt: null,

      // 自動巻き・手巻きならメンテナンス日を送信
      lastMaintenanceAt:
        formData.driveType === "自動巻き" || formData.driveType === "手巻き"
          ? formData.lastMaintenanceAt || null
          : null,

      //クォーツなら電池交換日を送信
      batteryUpdatedAt:
        formData.driveType === "クォーツ"
          ? formData.batteryUpdatedAt || null
          : null,
    };

    try {
      await axios.post("http://localhost:8080/api/watches", watchData);

      //登録成功後に一覧を更新
      onCreated();

      //フォームを初期状態に戻して閉じる
      setFormData(initialFormData);
      onHide();
    } catch (error) {
      console.error("時計の登録に失敗しました", error);
      setErrorMessage("時計の登録に失敗しました。入力内容を確認してください。");
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="watch-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>新規登録</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {/* ブランド */}
          <Form.Group className="watchc-form-group">
            <Form.Label>
              ブランド<span className="text-danger">*</span>
            </Form.Label>

            <Form.Select
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
            >
              <option value="">選択してください</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {/* モデル名 */}
          <Form.Group className="watch-form-group">
            <Form.Label>
              モデル名<span className="text-danger">*</span>
            </Form.Label>

            <Form.Control
              type="text"
              name="modelName"
              placeholder="例:Tank Must"
              value={formData.modelName}
              onChange={handleChange}
            />
          </Form.Group>
          {/* 駆動方式 */}
          <Form.Group className="watch-form-group">
            <Form.Label>駆動方式</Form.Label>
            <div className="watch-drive-options">
              {["自動巻き", "手巻き", "クォーツ"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline-dark"
                  className={
                    formData.driveType === type
                      ? "watch-drive-option active"
                      : "watch-drive-option"
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      driveType: type,
                      lastMaintenanceAt: "",
                      batteryUpdatedAt: "",
                    })
                  }
                >
                  {type}
                </Button>
              ))}
            </div>
          </Form.Group>
          {/* 型番 */}
          <Form.Group className="watch-form-group">
            <Form.Label>
              型番(Ref.)<span className="text-danger">*</span>
            </Form.Label>

            <Form.Control
              type="text"
              name="modelNumber"
              placeholder="例:WSTA0041"
              value={formData.modelNumber}
              onChange={handleChange}
            />
          </Form.Group>
          {/* <Form.Group className="watch-form-group">
          <Form.Label>最終稼働日</Form.Label>
          <Form.Control
            type="date"
            value={formData.lastUsedAt}
            onChange={(event) =>
              setFormData({ ...formData, lastUsedAt: event.target.value })
            }
          />
        </Form.Group> */}
          {/* 自動巻き・手巻きの場合 */}
          {(formData.driveType === "自動巻き" ||
            formData.driveType === "手巻き") && (
            <Form.Group className="watch-form-group">
              <Form.Label>最終メンテナンス日</Form.Label>

              <div className="watch-date-row">
                <Form.Control
                  type="date"
                  name="lastMaintenanceAt"
                  value={formData.lastMaintenanceAt}
                  onChange={handleChange}
                />

                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      lastMaintenanceAt: "",
                    })
                  }
                >
                  未記録
                </Button>
              </div>
              <Form.Text>
                メンテナンスを行なった日付を入力してください
              </Form.Text>
            </Form.Group>
          )}

          {/* <Form.Text>わからない場合は未記録のままで大丈夫です</Form.Text> */}

          {/* クォーツの場合 */}
          {formData.driveType === "クォーツ" && (
            <Form.Group className="watch-form-group">
              <Form.Label>最終電池交換日</Form.Label>
              <div className="watch-date-row">
                <Form.Control
                  type="date"
                  name="batteryUpdatedAt"
                  value={formData.batteryUpdatedAt}
                  onChange={handleChange}
                />

                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      batteryUpdatedAt: "",
                    })
                  }
                >
                  未記録
                </Button>
              </div>
              <Form.Text>電池を交換した日付を入力してください</Form.Text>
            </Form.Group>
          )}

          {/* メモ */}
          <Form.Group className="watch-form-group mb-0">
            <Form.Label>メモ</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="memo"
              placeholder="購入日、思い出、メンテナンス記録など"
              value={formData.memo}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="dark"
            type="submit"
            className="watch-submit-button"
            disabled={!isFormValid}
          >
            登録する
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default WatchCreate;

//時計の新規登録
//   const handleSubmit = async (event) => {
//     //フォーム送信による画面の再読み込みを防ぐ
//     event.preventDefault();
//     //前回のエラーエッセージを消す
//     setErrorMessage("");

//     //必須項目の入力チェック
//     if (!formData.brandId || !formData.modelName.trim()) {
//       alert("ブランドとモデル名は必須です。");
//       return;
//     }

//     //空の日付はnullにする
//     const watchData = {
//       ...formData,
//       brandId: Number(formData.brandId),
//       lastUsedAt: formData.lastUsedAt || null,
//       lastMaintenanceAt: formData.lastMaintenanceAt || null,
//       batteryUpdatedAt: formData.batteryUpdatedAt || null,
//     };

//     try {
//       //Spring Bootに時計情報を送信
//       await axios.post("http://localhost:8080/api/watches", watchData);
//       //登録成功後、時計一覧画面へ移動
//       navigate("/watches");
//     } catch (error) {
//       console.error("時計の登録に失敗しました", error);
//       setErrorMessage("時計の登録に失敗しました。入力内容を確認してください。");
//     }
//   };

//   return (
//     <Container className="py-4">
//       <Link to="/watches" className="btn btn-outline-dark mb-3">
//         ←時計一覧に戻る
//       </Link>
//       <h1 className="mb-4">時計の新規登録</h1>
//       {errorMessage && <p className="text-danger">{errorMessage}</p>}
//       <Form onSubmit={handleSubmit}>
//         <Form.Group className="mb-3">
//           <Form.Label>
//             ブランド<span className="text-danger">必須</span>
//           </Form.Label>
//           <Form.Select
//             required
//             value={formData.brandId}
//             onChange={(event) =>
//               setFormData({ ...formData, brandId: event.target.value })
//             }
//           >
//             <option value="">選択してください</option>
//             {brands.map((brand) => (
//               <option key={brand.id} value={brand.id}>
//                 {brand.brandName}
//               </option>
//             ))}
//           </Form.Select>
//           <Form.Label>
//             モデル名<span className="text-danger">必須</span>
//           </Form.Label>
//           <Form.Control
//             type="text"
//             required
//             placeholder="例:Tank Must"
//             value={formData.modelName}
//             onChange={(event) =>
//               setFormData({ ...formData, modelName: event.target.value })
//             }
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>型番</Form.Label>
//           <Form.Control
//             type="text"
//             placeholder="例:WSTA0041"
//             value={formData.modelNumber}
//             onChange={(event) =>
//               setFormData({ ...formData, modelNumber: event.target.value })
//             }
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>駆動方式</Form.Label>
//           <Form.Select
//             value={formData.driveType}
//             onChange={(event) =>
//               setFormData({
//                 ...formData,
//                 driveType: event.target.value,
//               })
//             }
//           >
//             <option value="">選択してください</option>
//             <option value="自動巻き">自動巻き</option>
//             <option value="手巻き">手巻き</option>
//             <option value="クォーツ">クォーツ</option>
//           </Form.Select>
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>最終稼働日</Form.Label>
//           <Form.Control
//             type="date"
//             value={formData.lastUsedAt}
//             onChange={(event) =>
//               setFormData({ ...formData, lastUsedAt: event.target.value })
//             }
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>最終メンテナンス日</Form.Label>
//           <Form.Control
//             type="date"
//             value={formData.lastMaintenanceAt}
//             onChange={(event) =>
//               setFormData({
//                 ...formData,
//                 lastMaintenanceAt: event.target.value,
//               })
//             }
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>電池交換日</Form.Label>
//           <Form.Control
//             type="date"
//             value={formData.batteryUpdatedAt}
//             onChange={(event) =>
//               setFormData({ ...formData, batteryUpdatedAt: event.target.value })
//             }
//           />
//         </Form.Group>

//         <Form.Group className="mb-4">
//           <Form.Label>メモ</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={3}
//             placeholder="時計についてのメモ"
//             value={formData.memo}
//             onChange={(event) =>
//               setFormData({
//                 ...formData,
//                 memo: event.target.value,
//               })
//             }
//           />
//         </Form.Group>

//         <Button variant="dark" type="submit">
//           登録する
//         </Button>
//       </Form>
//     </Container>
//     // <div>

//     //   <Link to="/Watchesdd">← 時計一覧に戻る</Link>
//     //   <h1>時計の新規登録</h1>
//     //   <p>ここに登録フォームを作成します</p>
//     // </div>
//   );
// }
