// ===============================
// app.js — Complete JWT Auth + React UI (Single File)
// ===============================

const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "my_secret_key"; // ⚠️ Use env variable in real apps

// Mock user (replace with DB later)
const user = { id: 1, username: "admin", password: "1234" };

// ===============================
// Serve React Frontend
// ===============================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>JWT Protected Routes - Full App</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      body { font-family: Arial; background: #f2f2f2; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
      .container { background:white; padding:30px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1); width:340px; text-align:center; }
      input, button { width:100%; padding:10px; margin:8px 0; border-radius:5px; border:1px solid #ccc; }
      button { background:#007bff; color:white; border:none; cursor:pointer; font-weight:bold; }
      button:hover { background:#0056b3; }
      .message { text-align:center; margin-top:10px; font-weight:bold; color:#333; }
    </style>
  </head>

  <body>
    <div id="root"></div>
    <script type="text/babel">
      const { useState, useEffect } = React;

      function App() {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [token, setToken] = useState(localStorage.getItem("token") || "");
        const [message, setMessage] = useState("");

        const handleLogin = async (e) => {
          e.preventDefault();
          setMessage("Logging in...");
          const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setMessage("✅ Logged in successfully!");
          } else {
            setMessage("❌ " + data.message);
          }
        };

        const handleLogout = () => {
          localStorage.removeItem("token");
          setToken("");
          setMessage("Logged out.");
        };

        const fetchProfile = async () => {
          const res = await fetch("/profile", {
            headers: { Authorization: "Bearer " + token }
          });
          const data = await res.json();
          if (res.ok) {
            setMessage("Welcome, " + data.user.username + "!");
          } else {
            setMessage("❌ " + data.message);
          }
        };

        useEffect(() => {
          if (token) fetchProfile();
        }, [token]);

        return (
          <div className="container">
            {!token ? (
              <>
                <h2>🔐 Login</h2>
                <form onSubmit={handleLogin}>
                  <input type="text" placeholder="Username" value={username}
                    onChange={(e) => setUsername(e.target.value)} required />
                  <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                  <button type="submit">Login</button>
                </form>
                <div className="message">{message}</div>
              </>
            ) : (
              <>
                <h2>✅ Protected Dashboard</h2>
                <p>{message}</p>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
  `);
});

// ===============================
// Backend API Routes
// ===============================

// Login and issue JWT
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// JWT verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "Token missing" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = userData;
    next();
  });
}

// Protected route
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

// ===============================
// Start Server
// ===============================
const PORT = 5000;
app.listen(PORT, () => console.log("✅ Server running on http://localhost:" + PORT));
