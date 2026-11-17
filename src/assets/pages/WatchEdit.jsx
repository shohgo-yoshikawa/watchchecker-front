import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
// import { Link, useNavigate, useParams } from "react-router-dom";

function WatchEdit({ id, show, onHide, onUpdated }) {
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

  //読み込み状態
  const [isLoading, setIsLoading] = useState(false);

  //エラーメッセージ
  const [errorMessage, setErrorMessage] = useState("");

  //モーダル表示時にブランド一覧と時計情報を取得
  useEffect(() => {
    if (!show) return;

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        //ブランド一覧と時計情報を同時に取得
        const [brandResponse, watchResponse] = await Promise.all([
          axios.get("http://localhost:8080/api/brands"),
          axios.get(`http://localhost:8080/api/watches/${id}`),
        ]);
        if (cancelled) return;
        const watch = watchResponse.data;
        setBrands(brandResponse.data);

        //取得した時計情報をフォームにセット
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
      } catch (error) {
        if (!cancelled) {
          console.error("時計情報の取得に失敗しました", error);
          setErrorMessage("時計情報の取得に失敗しました。");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, show]);

  //必要項目の入力チェック
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

  //駆動方式を変更

  const handleDriveTypeChange = (type) => {
    setFormData((previousData) => ({
      ...previousData,
      driveType: type,

      //駆動方式を変更した場合は日付をリセット
      lastMaintenanceAt:
        previousData.driveType === type ? previousData.lastMaintenanceAt : "",
      batteryUpdatedAt:
        previousData.driveType === type ? previousData.batteryUpdatedAt : "",
    }));
  };

  // モーダルを閉じる
  const handleClose = () => {
    setErrorMessage("");
    onHide();
  };

  // 時計情報を更新
  const handleSubmit = async (event) => {
    // フォーム送信による画面の再読み込みを防ぐ
    event.preventDefault();

    // 前回のエラーを消す
    setErrorMessage("");

    // 駆動方式を判定
    const isMechanical =
      formData.driveType === "自動巻き" || formData.driveType === "手巻き";

    const isQuartz = formData.driveType === "クォーツ";

    // Spring Bootに送信するデータ
    const watchData = {
      ...formData,
      brandId: Number(formData.brandId),

      // 最終稼働日は稼働ボタンで管理するため保持
      lastUsedAt: formData.lastUsedAt || null,

      // 自動巻き・手巻きならメンテナンス日を送信
      lastMaintenanceAt: isMechanical
        ? formData.lastMaintenanceAt || null
        : isQuartz
          ? null
          : formData.lastMaintenanceAt || null,

      // クォーツなら電池交換日を送信
      batteryUpdatedAt: isQuartz
        ? formData.batteryUpdatedAt || null
        : isMechanical
          ? null
          : formData.batteryUpdatedAt || null,
    };

    try {
      // Spring Bootの更新APIを呼び出す
      await axios.put(`http://localhost:8080/api/watches/${id}`, watchData);
    } catch (error) {
      console.error("時計の更新に失敗しました", error);

      setErrorMessage("時計の更新に失敗しました。入力内容を確認してください。");

      return;
    }

    // 更新成功後、詳細画面の情報を再取得
    await onUpdated();

    // モーダルを閉じる
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="watch-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>時計の編集</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {isLoading ? (
            <p className="text-secondary">読み込み中...</p>
          ) : (
            <>
              {errorMessage && <p className="text-danger">{errorMessage}</p>}

              {/* ブランド */}
              <Form.Group className="watch-form-group">
                <Form.Label>
                  ブランド名 <span className="text-danger">*</span>
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
                  モデル名 <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="modelName"
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
                      onClick={() => handleDriveTypeChange(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              {/* 型番 */}
              <Form.Group className="watch-form-group">
                <Form.Label>
                  型番（Ref.） <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleChange}
                />
              </Form.Group>

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
                    メンテナンスを行った日付を入力してください
                  </Form.Text>
                </Form.Group>
              )}

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
                  value={formData.memo}
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            type="button"
            onClick={handleClose}
          >
            キャンセル
          </Button>

          <Button
            variant="dark"
            type="submit"
            className="watch-submit-button"
            disabled={!isFormValid || isLoading}
          >
            変更を保存
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default WatchEdit;

//   //更新成功後、詳細画面の方法を再取得
// await onUpdate();

//     axios
//       .get("http://localhost:8080/api/brands")
//       .then((response) => {
//         setBrands(response.data);
//       })
//       .catch((error) => {
//         console.error("ブランド一覧の取得に失敗しました", error);
//       });

//     //編集対象の時計情報を取得
//     axios
//       .get(`http://localhost:8080/api/watches/${id}`)
//       .then((response) => {
//         const watch = response.data;

//         setFormData({
//           brandId: String(watch.brandId),
//           modelName: watch.modelName || "",
//           modelNumber: watch.modelNumber || "",
//           driveType: watch.driveType || "",
//           lastUsedAt: watch.lastUsedAt || "",
//           lastMaintenanceAt: watch.lastMaintenanceAt || "",
//           batteryUpdatedAt: watch.batteryUpdatedAt || "",
//           memo: watch.memo || "",
//         });
//       })
//       .catch((error) => {
//         console.error("時計情報の取得に失敗しました", error);
//       });
//   }, [id]);

//   //時計情報の更新
//   const handleSubmit = async (event) => {
//     //フォーム送信による画面の再読み込みを防ぐ
//     event.preventDefault();
//     //前回のエラーメッセージを消す
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
//       await axios.put(`http://localhost:8080/api/watches/${id}`, watchData);

//       //更新成功後、時計詳細画面へ移動
//       navigate(`/watches/${id}`);
//     } catch (error) {
//       console.error("時計の更新に失敗しました", error);
//       setErrorMessage("時計の更新に失敗しました。入力内容を確認してください。");
//     }
//   };

//   return (
//     <Container className="py-4">
//       <Link to={`/watches/${id}`} className="btn btn-outline-dark mb-3">
//         ←時計詳細に戻る
//       </Link>

//       <h1 className="mb-4">時計の編集</h1>
//       {errorMessage && <p className="text-danger">{errorMessage}</p>}

//       <Form onSubmit={handleSubmit}>
//         <Form.Group className="mb-3">
//           <Form.Label>ブランド</Form.Label>
//           <Form.Select
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
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>モデル名</Form.Label>
//           <Form.Control
//             type="text"
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
//               setFormData({ ...formData, driveType: event.target.value })
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

//         <Form.Group className="mb-3">
//           <Form.Label>メモ</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={3}
//             value={formData.memo}
//             onChange={(event) =>
//               setFormData({ ...formData, memo: event.target.value })
//             }
//           />
//         </Form.Group>
//         <Button variant="dark" type="submit">
//           変更を保存
//         </Button>
//       </Form>
//     </Container>
//   );
// }

// export default WatchEdit;
