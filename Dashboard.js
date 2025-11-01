import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    axios.get("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data.message))
    .catch(() => setData("Unauthorized"));
  }, []);

  return <h2>{data}</h2>;
}
