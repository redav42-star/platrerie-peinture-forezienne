(() => {
 const form=document.querySelector('#quote-form');
 if(!form)return;
 const result=document.querySelector('#quote-result');
 const text=document.querySelector('#quote-message');
 const status=document.querySelector('#quote-status');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const val=name=>String(data.get(name)||'').trim();
  text.value=`Bonjour Rémy,\n\nJe souhaite un devis pour mon chantier.\nCommune : ${val('commune')}\nTravaux : ${val('travaux')}\nDescription / surfaces : ${val('details')||'À préciser ensemble'}\nDélai souhaité : ${val('delai')||'À préciser ensemble'}\n\nJe pourrai joindre des photos à cet email.\n\nMerci.`;
  document.querySelector('#quote-email').href='mailto:redav42@gmail.com?subject='+encodeURIComponent('Demande de devis — '+val('commune'))+'&body='+encodeURIComponent(text.value);
  result.hidden=false;
  status.textContent='Votre message est prêt. Il n’a pas encore été envoyé.';
  result.focus();
 });
 document.querySelector('#quote-copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(text.value);status.textContent='Message copié. Collez-le dans votre messagerie et envoyez-le à redav42@gmail.com.';}
  catch{ text.focus();text.select();status.textContent='Sélectionnez et copiez le message, puis collez-le dans votre messagerie.'; }
 });
})();
