const teacherCal=requireTeacher();
let viewDate=new Date();
function requireTeacher(){
 const t=JSON.parse(localStorage.getItem("classflow_teacher")||"null");
 if(!t){location.href="teacher-login.html";return null} return t;
}
async function renderCalendar(){
 const grid=document.getElementById("calendarGrid"), title=document.getElementById("monthTitle"), msg=document.getElementById("calendarMessage");
 title.textContent=viewDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
 try{
  const res=await jsonp("getTeacherData",{username:teacherCal.username});if(!res.ok)throw new Error(res.error);
  const events=res.classes||[];
  const y=viewDate.getFullYear(),m=viewDate.getMonth();
  const first=new Date(y,m,1),start=(first.getDay()+6)%7,last=new Date(y,m+1,0).getDate(),prevLast=new Date(y,m,0).getDate();
  const cells=[];
  for(let i=0;i<42;i++){
   const dayIndex=i-start+1; let day=dayIndex,month=m,year=y,muted=false;
   if(dayIndex<1){day=prevLast+dayIndex;month=m-1;muted=true} else if(dayIndex>last){day=dayIndex-last;month=m+1;muted=true}
   const date=new Date(year,month,day), key=date.toDateString();
   const dayEvents=events.filter(e=>new Date(e.datetime).toDateString()===key);
   cells.push(`<div class="day-cell ${muted?"muted":""} ${key===new Date().toDateString()?"today":""}"><div class="day-num">${day}</div>${dayEvents.map(e=>{const d=new Date(e.datetime);return `<div class="calendar-event"><strong>${escapeHtml(d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}))} · ${escapeHtml(e.subject)}</strong><span>${escapeHtml(e.student)}</span></div>`}).join("")}</div>`);
  }
  grid.innerHTML=cells.join("");
 }catch(e){showMessage(msg,e.message,true)}
}
document.getElementById("prevMonth").onclick=()=>{viewDate.setMonth(viewDate.getMonth()-1);renderCalendar()};
document.getElementById("nextMonth").onclick=()=>{viewDate.setMonth(viewDate.getMonth()+1);renderCalendar()};
document.getElementById("logoutBtn").onclick=()=>{localStorage.removeItem("classflow_teacher");location.href="teacher-login.html"};
renderCalendar();
