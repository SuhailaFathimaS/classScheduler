function requireTeacher(){
 const t=JSON.parse(localStorage.getItem("classflow_teacher")||"null");
 if(!t){location.href="teacher-login.html";return null} return t;
}
const teacher=requireTeacher();
if(teacher){
 document.getElementById("teacherGreeting").textContent=`Hello, ${teacher.name}.`;
 document.getElementById("teacherDate").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
 loadTeacher();
}
async function loadTeacher(){
 const msg=document.getElementById("teacherMessage");hideMessage(msg);
 try{
   const res=await jsonp("getTeacherData",{username:teacher.username});
   if(!res.ok) throw new Error(res.error);
   const classes=res.classes||[], feedback=res.feedback||[];
   const todayKey=new Date().toDateString();
   document.getElementById("todayCount").textContent=classes.filter(c=>new Date(c.datetime).toDateString()===todayKey).length;
   document.getElementById("upcomingCount").textContent=classes.length;
   document.getElementById("feedbackCount").textContent=feedback.length;
   const avg=feedback.length?feedback.reduce((a,b)=>a+Number(b.rating||0),0)/feedback.length:0;
   document.getElementById("avgRating").textContent=avg?avg.toFixed(1):"—";
   const future=classes.filter(c=>new Date(c.datetime)>=new Date()).sort((a,b)=>new Date(a.datetime)-new Date(b.datetime)).slice(0,8);
   document.getElementById("teacherClasses").innerHTML=future.length?future.map(c=>{
     const d=new Date(c.datetime);return `<div class="class-item"><div class="class-time">${d.toLocaleDateString(undefined,{month:"short",day:"numeric"})}<br>${d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</div><div class="class-main"><strong>${escapeHtml(c.subject)}</strong><small>${escapeHtml(c.student)}${c.notes?" · "+escapeHtml(c.notes):""}</small></div><span class="class-status">${escapeHtml(c.status||"Scheduled")}</span></div>`
   }).join(""):'<div class="empty">No upcoming classes.</div>';
   document.getElementById("teacherFeedback").innerHTML=feedback.slice(-6).reverse().map(f=>`<div class="feedback-item"><div class="feedback-meta"><span>${escapeHtml(f.student)}</span><span class="stars-small">${"★".repeat(Number(f.rating||0))}${"☆".repeat(5-Number(f.rating||0))}</span></div><p>${escapeHtml(f.feedback)}</p><small>${escapeHtml(f.subject||"Class")} · ${escapeHtml(f.timestamp||"")}</small></div>`).join("")||'<div class="empty">No feedback yet.</div>';
 }catch(e){showMessage(msg,e.message,true)}
}
document.getElementById("refreshTeacher").addEventListener("click",loadTeacher);
document.getElementById("logoutBtn").addEventListener("click",()=>{localStorage.removeItem("classflow_teacher");location.href="teacher-login.html"});
