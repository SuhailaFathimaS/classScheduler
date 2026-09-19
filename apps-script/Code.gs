/*
  CLASSFLOW GOOGLE SHEETS BACKEND
  --------------------------------
  1. Create a Google Sheet.
  2. Create sheets named:
       Teachers
       Bookings
       Feedback
  3. Put the headers shown in README.md.
  4. Paste this code into Extensions > Apps Script.
  5. Deploy as Web app:
       Execute as: Me
       Who has access: Anyone
  6. Copy the /exec URL into js/config.js.

  NOTE:
  This project intentionally uses a simple Google-Sheets-based teacher login.
  It is suitable for prototypes/internal projects, NOT high-security production.
  Passwords are stored in the Teachers sheet as plain text because the user
  requested manual authentication using Sheets.
*/

const SHEET_NAMES = { teachers:"Teachers", bookings:"Bookings", feedback:"Feedback" };

function setupSheets(){
  const ss=SpreadsheetApp.getActive();
  const defs={
    Teachers:["username","password","name","active"],
    Bookings:["id","timestamp","student","email","date","time","datetime","subject","notes","status"],
    Feedback:["id","timestamp","student","email","subject","rating","feedback"]
  };
  Object.entries(defs).forEach(([name,headers])=>{
    let sh=ss.getSheetByName(name);
    if(!sh) sh=ss.insertSheet(name);
    if(sh.getLastRow()===0) sh.appendRow(headers);
  });
  return "Sheets ready.";
}

function doGet(e){
  const p=e&&e.parameter?e.parameter:{};
  const action=p.action||"health";
  let result;
  try{
    result=route_(action,p);
  }catch(err){
    result={ok:false,error:String(err.message||err)};
  }
  const body=JSON.stringify(result);
  if(p.callback) return ContentService.createTextOutput(`${p.callback}(${body})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function route_(action,p){
  if(action==="health") return {ok:true,message:"ClassFlow API is running."};
  if(action==="teacherLogin") return teacherLogin_(p);
  if(action==="bookClass") return bookClass_(p);
  if(action==="getStudentBookings") return getStudentBookings_(p);
  if(action==="submitFeedback") return submitFeedback_(p);
  if(action==="getTeacherData") return getTeacherData_(p);
  throw new Error("Unknown action.");
}

function sheet_(name){return SpreadsheetApp.getActive().getSheetByName(name)}

function rows_(name){
  const sh=sheet_(name), values=sh.getDataRange().getValues();
  if(values.length<2)return [];
  const headers=values[0].map(String);
  return values.slice(1).filter(r=>r.some(v=>v!=="")).map(r=>{
    const o={};headers.forEach((h,i)=>o[h]=r[i]);return o;
  });
}

function iso_(value){
  if(value instanceof Date) return Utilities.formatDate(value,Session.getScriptTimeZone(),"yyyy-MM-dd'T'HH:mm:ss");
  return String(value);
}

function clean_(v,max){return String(v||"").trim().slice(0,max||500)}

function teacherLogin_(p){
  const u=clean_(p.username,80), pw=clean_(p.password,200);
  if(!u||!pw) return {ok:false,error:"Username and password are required."};
  const t=rows_("Teachers").find(x=>String(x.username).toLowerCase()===u.toLowerCase() && String(x.password)===pw && String(x.active).toLowerCase()!=="false");
  if(!t)return {ok:false,error:"Invalid teacher credentials."};
  return {ok:true,username:String(t.username),name:String(t.name||t.username)};
}

function bookClass_(p){
  const student=clean_(p.student,80),email=clean_(p.email,120),date=clean_(p.date,20),time=clean_(p.time,10),subject=clean_(p.subject,100),notes=clean_(p.notes,300);
  if(!student||!date||!time||!subject) return {ok:false,error:"Name, date, time and subject are required."};
  const dt=new Date(`${date}T${time}:00`);
  if(isNaN(dt.getTime()))return {ok:false,error:"Invalid date or time."};
  if(dt.getTime()-Date.now()<5*60*60*1000)return {ok:false,error:"Classes must be scheduled at least 5 hours in advance."};

  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const existing=rows_("Bookings");
    const conflict=existing.some(x=>String(x.datetime)===iso_(dt) && String(x.status||"Scheduled").toLowerCase()!=="cancelled");
    if(conflict)return {ok:false,error:"That time is already booked. Please choose another time."};
    const id=Utilities.getUuid();
    sheet_("Bookings").appendRow([id,new Date(),student,email,date,time,dt,subject,notes,"Scheduled"]);
    return {ok:true,id};
  }finally{lock.releaseLock()}
}

function getStudentBookings_(p){
  const student=clean_(p.student,80).toLowerCase();
  if(!student)return {ok:true,bookings:[]};
  const now=new Date();
  const bookings=rows_("Bookings").filter(x=>String(x.student).toLowerCase()===student && new Date(x.datetime)>=now && String(x.status||"Scheduled").toLowerCase()!=="cancelled")
    .sort((a,b)=>new Date(a.datetime)-new Date(b.datetime)).slice(0,20).map(publicBooking_);
  return {ok:true,bookings};
}

function publicBooking_(x){
  return {id:String(x.id),student:String(x.student),subject:String(x.subject),datetime:iso_(x.datetime),status:String(x.status||"Scheduled"),notes:String(x.notes||"")};
}

function submitFeedback_(p){
  const student=clean_(p.student,80),email=clean_(p.email,120),subject=clean_(p.subject,100),rating=Number(p.rating),feedback=clean_(p.feedback,1000);
  if(!student||!feedback||rating<1||rating>5)return {ok:false,error:"Name, rating and feedback are required."};
  sheet_("Feedback").appendRow([Utilities.getUuid(),new Date(),student,email,subject,rating,feedback]);
  return {ok:true};
}

function getTeacherData_(p){
  // Login is checked against the Teachers sheet on every request.
  const u=clean_(p.username,80);
  const teacher=rows_("Teachers").find(x=>String(x.username).toLowerCase()===u.toLowerCase() && String(x.active).toLowerCase()!=="false");
  if(!teacher)return {ok:false,error:"Teacher session is not valid."};

  const classes=rows_("Bookings").filter(x=>String(x.status||"Scheduled").toLowerCase()!=="cancelled" && new Date(x.datetime)>=new Date(Date.now()-24*60*60*1000))
    .sort((a,b)=>new Date(a.datetime)-new Date(b.datetime)).map(publicBooking_);
  const feedback=rows_("Feedback").map(x=>({student:String(x.student),subject:String(x.subject||""),rating:Number(x.rating),feedback:String(x.feedback),timestamp:iso_(x.timestamp)}));
  return {ok:true,teacher:{username:String(teacher.username),name:String(teacher.name||teacher.username)},classes,feedback};
}
