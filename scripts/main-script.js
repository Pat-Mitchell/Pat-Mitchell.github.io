let btn = document.getElementById("menuBtn");

btn.addEventListener("click", function() {
  let panel = document.getElementsByClassName("mainNav");
  if (panel[0].style.maxHeight) {
    panel[0].style.maxHeight = null;
  } else {
    panel[0].style.maxHeight = panel[0].scrollHeight + "px";
  }
});

let articleTitle = document.getElementById("h1Title");
let articleCredits = document.getElementById("ulCredits");
let prevArticle = document.getElementById("prevArticle");
let nextArticle = document.getElementById("nextArticle");
let body = document.getElementById("divBody");
articleTitle.innerHTML = article.title;
articleCredits.innerHTML = `
<li>By ${article.author}</li>
<li>Posted ${article.date}</li>
`;
if(article.previousArticle == null) {
  prevArticle.style.visibility = "hidden";
} else {
  prevArticle.innerHTML = `
  <span class="prev-next-icon"><i class="arrow left"></i></span>
  <span class="prev-next-title"><a href="${article.previousArticle}.html">${article.previousArticleTitle}</a></span>
  `;
}
if(article.nextArticle == null) {
  nextArticle.style.visibility = "hidden";
} else {
  nextArticle.innerHTML = `
  <span class="next-title"><a href="${article.nextArticle}.html">${article.nextArticleTitle}</a></span>
  <span class="next-icon"><i class="arrow right"></i></span>
  `;
}
body.innerHTML = article.body;
