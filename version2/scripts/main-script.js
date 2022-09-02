let btn = document.getElementById("menuBtn");

btn.addEventListener("click", function() {
  let panel = document.getElementsByClassName("mainNav");
  if (panel[0].style.maxHeight) {
    panel[0].style.maxHeight = null;
  } else {
    panel[0].style.maxHeight = panel[0].scrollHeight + "px";
  }
});

function writeToArticle(articleName, scripts = null) {
  let article = document.getElementById("mainArticle");
  fetch(`${articleName}`)
  .then((response)=>response.text())
  .then((data, resolve)=>{
    article.innerHTML = data;
  })
  .then((e) => {
    if(scripts !== null)
    scripts.forEach((item, i) => {
      console.log(item);
    });
  });
}

function loadScript(script) {
  const s = document.createElement('script')
  s.src = script
  document.head.append(s)
}

function test() {
  console.log(`yup`);
}
