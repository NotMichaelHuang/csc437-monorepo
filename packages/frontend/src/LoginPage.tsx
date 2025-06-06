import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";


interface LoginPageProps {
  isRegistering: boolean;
  onAuthSuccess: (token: string) => void;
}

export function LoginPage({ isRegistering, onAuthSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setPending(true);

    try {
      const endpoint = isRegistering ? "/auth/register" : "/auth/login";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!resp.ok) {
        let message = `Request failed (${resp.status})`;
        try {
          const data = (await resp.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // ignore parse error
        }
        setError(message);
        setPending(false);
        return;
      }

      const { token } = (await resp.json()) as { token: string };
      onAuthSuccess(token);
      navigate("/images", { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: 4 }}>
      <h2>{isRegistering ? "Register a New Account" : "Log In"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            disabled={pending}
            required
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            disabled={pending}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <button type="submit" disabled={pending} style={{ width: "100%", padding: "0.75rem" }}>
          {pending ? (isRegistering ? "Registering…" : "Logging in…") : isRegistering ? "Register" : "Log In"}
        </button>
      </form>

      {/* Show any error under the form */}
      {error && (
        <p role="alert" style={{ color: "red", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        {!isRegistering ? (
          <p>
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
        ) : (
          <p>
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        )}
      </div>
    </div>
  );
}
