const bookingForm = document.getElementById("bookingForm");
const message = document.getElementById("studentMessage");
const dateInput = document.getElementById("classDate");
const timeInput = document.getElementById("classTime");
const nameInput = document.getElementById("studentName");
const upcomingList = document.getElementById("upcomingList");

const min = localDateTimeMin();
dateInput.min = min.date;
document.getElementById("todayChip").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});

function selectedDateTime(){
  return new Date(`${dateInput.value}T${timeInput.value}`);
}
async function loadBookings(){
  const name = nameInput.value.trim();
  if(!name){ upcomingList.innerHTML = '<div class="empty">Enter your name above and your bookings will appear here.</div>'; return; }
  try{
    const res = await jsonp("getStudentBookings",{student:name});
    if(!res.ok) throw new Error(res.error);
    const rows = res.bookings || [];
    if(!rows.length){ upcomingList.innerHTML='<div class="empty">No upcoming classes found for this name.</div>'; return; }
    upcomingList.innerHTML = rows.map(x => {
      const dt = new Date(x.datetime);
      return `<div class="class-item"><div class="class-time">${dt.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</div><div class="class-main"><strong>${escapeHtml(x.subject)}</strong><small>${dt.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})} · ${escapeHtml(x.student)}</small></div><span class="class-status">${escapeHtml(x.status||"Scheduled")}</span></div>`;
    }).join("");
  }catch(e){ upcomingList.innerHTML=`<div class="empty">${escapeHtml(e.message)}</div>`; }
}

bookingForm.addEventListener("submit", async e => {
  e.preventDefault();
  hideMessage(message);
  const dt = selectedDateTime();
  if(isNaN(dt.getTime())) return showMessage(message,"Please choose a valid date and time.",true);
  if(dt.getTime() < Date.now()+5*60*60*1000) return showMessage(message,"This class is too soon. Please choose a time at least 5 hours from now.",true);
  const btn = document.getElementById("bookBtn"); btn.disabled=true; btn.textContent="Saving…";
  try{
    const res = await jsonp("bookClass",{
      student:nameInput.value.trim(),
      email:document.getElementById("studentEmail").value.trim(),
      date:dateInput.value,time:timeInput.value,
      subject:document.getElementById("subject").value.trim(),
      notes:document.getElementById("notes").value.trim()
    });
    if(!res.ok) throw new Error(res.error);
    showMessage(message,"Class booked successfully. It is now on the teacher calendar.");
    bookingForm.reset(); dateInput.min=min.date;
    await loadBookings();
  }catch(err){ showMessage(message,err.message,true); }
  finally{ btn.disabled=false; btn.innerHTML='Confirm class <span>→</span>'; }
});
nameInput.addEventListener("blur",loadBookings);
document.getElementById("refreshBtn").addEventListener("click",loadBookings);
