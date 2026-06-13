const { useState, useEffect } = React;

const API_BASE = "http://localhost/micash/backend";

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [storedToken, setStoredToken] = useState("");
    const [storedEmail, setStoredEmail] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !password) {
            setError("Email and password required");
            return;
        }

        const action = isLogin ? "login" : "signup";
        
        // For signup, access token is required
        if (!isLogin && !accessToken) {
            setError("Access token required for signup");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: action,
                    email: email,
                    password: password,
                    access_token: isLogin ? "" : accessToken
                })
            });

            const data = await response.json();

            if (data.success) {
                if (isLogin) {
                    setStoredToken(data.access_token);
                    setStoredEmail(data.email);
                    setLoggedIn(true);
                } else {
                    setSuccess("Account created! Please login.");
                    setIsLogin(true);
                    setEmail("");
                    setPassword("");
                    setAccessToken("");
                }
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Network error: " + err.message);
        }
    };

    if (loggedIn) {
        return <PaymentPage email={storedEmail} token={storedToken} onLogout={() => setLoggedIn(false)} />;
    }

    return (
        <div className="container">
            <div className="logo">
                <h1>MICASH</h1>
                <div className="tagline">✦ B2B PAYMENTS ✦</div>
            </div>
            <h2>{isLogin ? "Login" : "Create Account"}</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <form onSubmit={handleAuth}>
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {!isLogin && (
                    <div className="input-group">
                        <label>Firestore Access Token</label>
                        <input type="text" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Paste your Google Firestore OAuth2 token" required />
                        <small style={{ color: "#888", display: "block", marginTop: "5px" }}>Token is not stored permanently</small>
                    </div>
                )}
                <button type="submit">{isLogin ? "Login →" : "Sign Up →"}</button>
            </form>
            <div className="switch-link">
                {isLogin ? "No account? " : "Already have an account? "}
                <a onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}>{isLogin ? "Sign Up" : "Login"}</a>
            </div>
        </div>
    );
}

function PaymentPage({ email, token, onLogout }) {
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [description, setDescription] = useState("");
    const [accessToken, setAccessToken] = useState(token || "");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        if (!accessToken) {
            setError("Please paste your Firestore access token");
            setLoading(false);
            return;
        }

        if (!amount || !recipient) {
            setError("Amount and recipient are required");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/payment.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: accessToken,
                    amount: parseFloat(amount),
                    recipient: recipient,
                    description: description,
                    email: email
                })
            });

            const data = await response.json();
            if (data.success) {
                setResult(data);
                setAmount("");
                setRecipient("");
                setDescription("");
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Payment failed: " + err.message);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setAmount("");
        setRecipient("");
        setDescription("");
        setResult(null);
        setError("");
    };

    return (
        <div className="container">
            <div className="logo">
                <h1>MICASH</h1>
                <div className="tagline">✦ B2B PAYMENTS ✦</div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ color: "#D4AF37" }}>Welcome, {email}</span>
                <button onClick={onLogout} style={{ width: "auto", padding: "6px 15px", background: "#333" }}>Logout</button>
            </div>

            <div className="card">
                <div className="input-group">
                    <label>🔑 Firestore Access Token (paste each time)</label>
                    <input type="text" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Paste your OAuth2 access token here" required />
                    <small style={{ color: "#888" }}>Token is not saved — you need to paste it for every session</small>
                </div>
            </div>

            <form onSubmit={handlePayment}>
                <div className="input-group">
                    <label>💰 Amount (USD)</label>
                    <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1299.99" required />
                </div>
                <div className="input-group">
                    <label>🏢 Recipient B2B ID</label>
                    <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Business ID / Account" required />
                </div>
                <div className="input-group">
                    <label>📝 Description</label>
                    <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Invoice #, PO number, etc."></textarea>
                </div>
                
                {error && <div className="error">{error}</div>}
                {result && (
                    <div className="success">
                        ✅ Payment Complete!<br />
                        Transaction ID: {result.transaction_id}<br />
                        Amount: ${result.amount}<br />
                        Recipient: {result.recipient}
                    </div>
                )}
                
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" disabled={loading}>
                        {loading ? "Processing..." : "💸 Send B2B Payment"}
                    </button>
                    <button type="button" onClick={resetForm} style={{ background: "#333" }}>
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
