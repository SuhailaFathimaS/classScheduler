let selectedRating=0;
const stars=document.querySelectorAll("#stars button");
stars.forEach(btn=>btn.addEventListener("click",()=>{
  selectedRating=Number(btn.dataset.value);
  document.getElementById("rating").value=selectedRating;
  stars.forEach(s=>s.classList.toggle("selected",Number(s.dataset.value)<=selectedRating));
}));
document.getElementById("feedbackForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const msg=document.getElementById("feedbackMessage");
  hideMessage(msg);
  if(!selectedRating) return showMessage(msg,"Please choose a rating.",true);
  const btn=document.getElementById("feedbackBtn");btn.disabled=true;btn.textContent="Sending…";
  try{
    const res=await jsonp("submitFeedback",{
      student:document.getElementById("fbName").value.trim(),
      email:document.getElementById("fbEmail").value.trim(),
      subject:document.getElementById("fbSubject").value.trim(),
      rating:selectedRating,
      feedback:document.getElementById("fbText").value.trim()
    });
    if(!res.ok) throw new Error(res.error);
    showMessage(msg,"Thank you — your feedback has been recorded.");
    document.getElementById("feedbackForm").reset();selectedRating=0;
    stars.forEach(s=>s.classList.remove("selected"));
  }catch(err){showMessage(msg,err.message,true)}
  finally{btn.disabled=false;btn.innerHTML='Send feedback <span>→</span>'}
});
