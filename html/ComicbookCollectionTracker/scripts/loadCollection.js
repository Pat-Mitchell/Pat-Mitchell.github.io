let sideNav = document.getElementById("collectionItems");
let collectionMap = new Map();
let seriesArray = []; // Sorted array of each series since Maps can't sort

// Add each issue to the map
collection.forEach(e => {
  if(!collectionMap.has(e.series)){
    collectionMap.set(e.series, []);
    seriesArray.push(e.series);
  }
  collectionMap.get(e.series).push(e);
});

// Sort the issues by number for each entry
collectionMap.forEach(v => {
  v.sort((a,b) => {
    return a.issue - b.issue;
  });
});

// Sort the series by abc
seriesArray.sort();

/*
  Temp variable because it seems browsers auto-close
  open divs if you add to the innerhtml on the fly.

  for example:
    sideNav.innerHTML += `<div>` // adds a <div></div>
    sideNav.innerHTML += `text` // adds floating text outside the div
    sideNav.innerHTML += `</div>` // ignored
*/
let temp = "";

seriesArray.forEach(e => {
  temp += `<button class="dropdown-btn">${collectionMap.get(e)[0].displayName}</button>`;
  temp += `<div class="dropdownContainer">`;
  collectionMap.get(e).forEach((i, n) => temp += `<div><a href="#${e};${n}" class="issue-btn">#${i.issue}</a></div>`);
  temp += `</div>`;
});

sideNav.innerHTML = temp;
