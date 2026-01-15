const BACKEND_URL = "https://scrim-backend.onrender.com";

async function loadRegistrations() {
  try {
    const res = await fetch(`${BACKEND_URL}/adminRegs`);
    const data = await res.json();
    const tbody = document.getElementById("adminTable");
    tbody.innerHTML = "";

    data.forEach((reg)=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${reg.teamName}</td>
        <td>${reg.whatsapp}</td>
        <td>${reg.time}</td>
        <td>${reg.fee}</td>
        <td><a href="${BACKEND_URL}/uploads/${reg.screenshot}" target="_blank">View</a></td>
        <td class="status-${reg.status.toLowerCase()}">${reg.status}</td>
        <td>
          <button class="accept"
 onclick="adminAction(${reg.id}, 'Accepted', '${reg.whatsapp}')">
Accept</button>

<button class="reject"
 onclick="adminAction(${reg.id}, 'Rejected', '${reg.whatsapp}')">
Reject</button>
           </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(err){
    console.error("Error loading registrations:", err);
  }
}

async function adminAction(i, status, whatsappNumber){
  try {
    // Send status update to backend
    await fetch(`${BACKEND_URL}/adminAction/${i}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({status})
    });

    // Send WhatsApp notification (opens in new tab/app)
    if(whatsappNumber){
      const message = `Hello! Your Free Fire Scrim registration has been ${status}.`;
      const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }

    // Reload table
    loadRegistrations();
  } catch(err){
    console.error("Admin action failed:", err);
  }
}

// Load table on page load
loadRegistrations();
