import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  // 入力されたログインIDとパスワード
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState("");

  // 送信中かどうか
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // ログイン処理
  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Spring BootのログインAPIに情報を送信
      await axios.post("/api/auth/login", {
        loginId: loginId,
        loginPass: loginPass,
      });

      // ログイン成功後、時計一覧へ移動
      navigate("/watches", { replace: true });
    } catch (error) {
      // ログインに失敗した場合
      setErrorMessage(
        error.response?.data?.message ||
          "ログインに失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="login-page">
      <div className="login-card">
        <div className="login-logo">◉ WATCHCHECKER</div>

        <div className="login-heading">
          <h1>ログイン</h1>
          <p>アカウント情報を入力してください。</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>ログインID</Form.Label>
            <Form.Control
              type="text"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="ログインIDを入力"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>パスワード</Form.Label>
            <Form.Control
              type="password"
              value={loginPass}
              onChange={(event) => setLoginPass(event.target.value)}
              placeholder="パスワードを入力"
              required
            />
          </Form.Group>

          {errorMessage && <p className="login-error">{errorMessage}</p>}

          <Button
            type="submit"
            className="login-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default Login;
