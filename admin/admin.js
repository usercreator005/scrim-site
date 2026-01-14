async function loadRegistrations() {
  const res = await fetch("https://scrim-backend.onrender.com/adminRegs");
  const data = await res.json();
  const tbody = document.getElementById("adminTable");
  tbody.innerHTML = "";

  data.forEach((reg,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${reg.teamName}</td>
      <td>${reg.whatsapp}</td>
      <td>${reg.time}</td>
      <td>${reg.fee}</td>
      <td><a href="https://scrim-backend.onrender.com/uploads/${reg.screenshot}" target="_blank">View</a></td>
      <td>${reg.status}</td>
      <td>
        <button onclick="adminAction(${i}, 'Accepted', '${reg.whatsapp}')">Accept</button>
        <button onclick="adminAction(${i}, 'Rejected', '${reg.whatsapp}')">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function adminAction(i, status, whatsappNumber){
  // Backend me status update
  await fetch(`https://scrim-backend.onrender.com/adminAction/${i}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({status})
  });

  // WhatsApp notification
  if(whatsappNumber){
    const message = `Hello! Your Free Fire Scrim registration has been ${status}.`;
    const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank"); // Mobile browser / WhatsApp app
  }

  // Reload admin table
  loadRegistrations();
}

// Load table on page load
loadRegistrations();
