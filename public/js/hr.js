document.addEventListener('DOMContentLoaded',()=>{
 const search=document.getElementById('tableSearch'),table=document.getElementById('recordsTable');
 if(search&&table)search.addEventListener('input',()=>{const q=search.value.toLowerCase();table.querySelectorAll('tbody tr').forEach(row=>row.style.display=row.innerText.toLowerCase().includes(q)?'':'none');});
});
