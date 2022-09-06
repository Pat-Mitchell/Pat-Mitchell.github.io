let ddbtn = document.getElementsByClassName("dropdown-btn");
let issbtn = document.getElementsByClassName("issue-btn");
let topbtn = document.getElementsByClassName("navElement");
let topNavs = document.getElementsByClassName("navDropdown");

//************* EventListener for Save event **********
document.getElementById("save_selec").addEventListener("click", function() {
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  const blob = new Blob([`collection = ` + JSON.stringify(collection)], {type: 'text/plain'});
  url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = `collection` + `.json`;
  a.click();
  window.URL.revokeObjectURL(url);
});

//************* EventListener for clear event **********
document.getElementById("clear_selec").addEventListener("click", function() {
  collection = [];
  seriesArray = [];
  collectionMap.clear();
  let elementsToRemove = document.getElementsByClassName("dropdown-btn");
  while(elementsToRemove.length > 0) {
    elementsToRemove[0].remove();
  }
  document.getElementById('comicCell').innerHTML = ``;
});


//************* EventListener for New Comic function **********
let newComicBtn = document.getElementById("newcomic-btn");
newComicBtn.addEventListener("click", function() {
  const form = document.getElementById('newComicForm');
  let newEntry = Object.values(form).reduce((obj,field) => { obj[field.name] = field.value; return obj }, {});
  // console.log(newEntry);
  newEntry.series = newEntry.displayName.replace(/ /g,"_");
  newEntry.credits = creatReg(newEntry.credits);

  // Regex for characters
  tempArr = [];
  const regex = /([a-zA-Z0-9_ ]+),?/g;
  const str = newEntry.characters;
  let m;

  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    // The result can be accessed through the `m`-variable.
    tempArr.push(m[1].trim());
  }

  newEntry.characters = tempArr;

  update(newEntry);
  if (form.parentElement.style.display === "block") {
    form.parentElement.style.display = "none";
  }

  function creatReg(str) {
    const regex = /([a-zA-Z0-9 ]+);([a-zA-Z0-9 ]+),? ?/gm;
    let m;
    let c = [];

    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      c.push([m[1].trim(), m[2].trim()]);
    }
    return c;
  }
});

let cancelNewBtn = document.getElementById("cancelnew-btn");
cancelNewBtn.addEventListener("click", function() {
  const form = document.getElementById('newComicForm');
  form.querySelectorAll('input').forEach(e => {
    e.value = ``;
  });
  if (form.parentElement.style.display === "block") {
    form.parentElement.style.display = "none";
  }
});

//************* Modify the collection json **************
function update(entry) {
  /* append and sort the new entry */
  if(!collectionMap.has(entry.series)){
    collectionMap.set(entry.series, []);
    seriesArray.push(entry.series);
  }
  if(!issueExists(entry)) {
    collection.push(entry);
    // console.log(collectionMap.get(entry.series));
    collectionMap.get(entry.series).push(entry);
    collectionMap.forEach(v => {
      v.sort((a,b) => {
        return a.issue - b.issue;
      });
    });
    seriesArray.sort();

    /* update the side panel */
    let temp = "";
    seriesArray.forEach(e => {
      temp += `<button class="dropdown-btn">${collectionMap.get(e)[0].displayName}</button>`;
      temp += `<div class="dropdownContainer">`;
      collectionMap.get(e).forEach((i, n) => temp += `<div><a href="#${e};${n}" class="issue-btn">#${i.issue}</a></div>`);
      temp += `</div>`;
    });

    sideNav.innerHTML = temp;

    // Need to readd the event listeners
    addSideNavigation();
    addIssueNavigation();
  }
}

function issueExists(a) {
  let found = false;
  collectionMap.get(a.series).forEach(e => {
    if(e.issue == a.issue) {
      console.error(`Entry already exists`);
      found = true;
    }
  });
  return found;
}

// ******** Dropdown button code *********
// Side navigation bar
function addSideNavigation() {
  for (let i = 0; i < ddbtn.length; i++) {
    // Dropdown buttons
    ddbtn[i].addEventListener("click", function() {
      this.classList.toggle("active");
      let panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
}
addSideNavigation();

//Top Navigation
function addTopNavigation() {
  for (let i = 0; i < topbtn.length; i++) {
    // Each btn shows a div
    topbtn[i].addEventListener("click", function() {
      this.classList.toggle("active");
      let panel = this.nextElementSibling;
      panel.style.left = `${this.offsetLeft + 12}px`;
      panel.style.top = `${this.offsetTop + 59}px`;
      panel.style.color = `black`;
      for(let i = 0; i < topNavs.length; i++) {
        if(topNavs[i].style.display === "block" && this.nextElementSibling != topNavs[i])
          topNavs[i].style.display = "none";
      }
      if(panel.style.display === "block") {
        panel.style.display = "none";
      }
      else {
        panel.style.display = "block";
      }
    });
  }
}
addTopNavigation()

// ********** Grab info from the collection map ************
function addIssueNavigation() {
  for(let i = 0; i < issbtn.length; i++) {
    issbtn[i].addEventListener("click", function() {
      const regex = /(\w+);(\d+)/g;
      const str = this.getAttribute("href").substring(1);
      let m;

      while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        let s = collectionMap.get(m[1])[m[2]];
        writeToDisplayCell(s);
      }
    });
  }
}
addIssueNavigation();

// NOTICE: This line is to make formatting the info cell faster
// comment it out when finished. DO NOT DELETE. Useful for future formatting
// writeToDisplayCell(collectionMap.get("Adventures_of_Superman")["0"]);


// ********* Send comic info to info cell ***************
function writeToDisplayCell(info) {

  let htmlStr = `<div id="infoDiv"><h1 id="display-name">${info.displayName} #${info.issue}</h1>
                <aside>
                  <figure>
                    <h3>"${info.chapterName}"</h3>
                    <img src="${info.coverImage}" id="cover-img">
                    <figcaption>Cover</figcaption>
                  </figure>
                </aside>
                <div class="comic-info-div">
                  <p id="date-published">Cover Date: ${info.coverDate}</p>
                  <p id="publisher-info">Publisher: ${info.publisher}</p>
                </div>
                <div class="comic-tables-div">
                  <table id="credit-table" class="comic-info-table">
                    <tr>
                      <th colspan="2">Credits</th>
                    </tr>
                `;

  info.credits.forEach(e => {
    htmlStr += `    <tr>
                      <td class="credit-title">${e[0]}</td>
                      <td class="credit-name">${e[1]}</td>
                    </tr>
                `;
  });
  htmlStr += `    </table><br>
                  <table id="character-table" class="comic-info-table">
                    <tr>
                      <th>Characters</th>
                    </tr>
              `;
  info.characters.forEach(e => {
    htmlStr += `    <tr>
                      <td>${e}</td>
                    </tr>
               `;
  });
  htmlStr += `    </table>
                </div>
              </div>
             `;
  document.getElementById('comicCell').innerHTML = htmlStr;
}
