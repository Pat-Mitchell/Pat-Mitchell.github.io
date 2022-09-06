let btn = document.getElementById("menuBtn");

btn.addEventListener("click", function() {
  let panel = document.getElementsByClassName("mainNav");
  if (panel[0].style.maxHeight) {
    panel[0].style.maxHeight = null;
  } else {
    panel[0].style.maxHeight = panel[0].scrollHeight + "px";
  }
});

function writeToArticle(articleName) {
  let article = document.getElementById("mainArticle");
  fetch(`${articleName}`)
  .then((response)=>response.text())
  .then((data, resolve)=>{
    article.innerHTML = `<iframe src="${articleName}" style="width:100%;" frameBorder="0" scrolling="no" id="Iframe"></iframe>`;
  })
  .then((e) => {
    var frame = document.getElementById("Iframe");
    frame.onload = function()
    {
      frame.style.height =
      frame.contentWindow.document.body.scrollHeight + 'px';
    }
  });
}
