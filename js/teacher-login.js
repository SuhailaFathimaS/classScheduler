const form=document.getElementById("teacherLoginForm"), msg=document.getElementById("loginMessage");
form.addEventListener("submit",async e=>{
 e.preventDefault(); hideMessage(msg);
 const btn=document.getElementById("loginBtn");btn.disabled=true;btn.textContent="Checking…";
 try{
   const res=await jsonp("teacherLogin",{username:document.getElementById("teacherUsername").value.trim(),password:document.getElementById("teacherPassword").value});
   if(!res.ok) throw new Error(res.error||"Invalid teacher credentials.");
   localStorage.setItem("classflow_teacher",JSON.stringify({username:res.username,name:res.name||res.username}));
   location.href="teacher.html";
 }catch(err){showMessage(msg,err.message,true)}
 finally{btn.disabled=false;btn.innerHTML='Open teacher dashboard <span>→</span>'}
});
