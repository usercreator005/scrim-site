<script>
const BACKEND_URL = "https://scrim-backend.onrender.com";

async function login() {
  const password = document.getElementById("pass").value;
  if(!password){
    alert("Enter password");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if(!data.success){
      alert(data.message);
      return;
    }

    // ✅ Store backend-issued JWT
    localStorage.setItem("adminToken", data.token);

    // Redirect to dashboard
    window.location.href = "dashboard.html";

  } catch(err){
    console.error("Login failed:", err);
    alert("Server error, try again");
  }
}
</script>
