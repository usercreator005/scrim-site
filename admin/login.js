<script>
const BACKEND_URL = "https://scrim-backend.onrender.com";

async function adminLogin() {
  const password = document.getElementById("password").value;

  if (!password) {
    alert("Password required");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ SAVE TOKEN
    localStorage.setItem("adminToken", data.token);

    // ✅ REDIRECT TO DASHBOARD
    window.location.href = "dashboard.html";

  } catch (err) {
    alert("Server error");
    console.error(err);
  }
}
</script>
