let aboutMe = document.getElementById("aboutMe");
let projects = document.getElementById("projects");
let infoRow = document.getElementById("infoRow");

aboutMe.addEventListener("click", function() {
  displayAboutMe();
});

projects.addEventListener("click", function() {
  displayProjects();
});

function getPage(str) {
  document.getElementById("projectCell").innerHTML = `
    <iframe src="html\\${str}"></iframe>
  `
}

function displayProjects() {
  infoRow.innerHTML = `
    <td id="projectNavigation">
      <p class="projectSelection" id="project1" onclick="getPage('test.html')">Project1</p>
      <p class="projectSelection" id="project2">Project2</p>
      <p class="projectSelection" id="project3">Project3</p>
    </td>
    <td id="projectCell">
    </td>
  `
}

function displayAboutMe() {
  infoRow.innerHTML = `
    <td>
      <p class="infoHeader">&ensp;&ensp;Experience</p>
      <p>&ensp;&ensp;&ensp;&ensp;Plate Room Operator at Dow Jones</p>
      <p>&ensp;&ensp;&ensp;&ensp;Supplemental Instruction Leader at STCC</p>
      <p>&ensp;&ensp;&ensp;&ensp;Dining Room Services at Loomis Communities Retirement Home</p>
      <p class="infoHeader">&ensp;&ensp;Education</p>
      <p>&ensp;&ensp;&ensp;&ensp;Springfield Technical Community College - 2020</p>
      <p>&ensp;&ensp;&ensp;&ensp;Western New England University - 2017</p>
      <p class="infoHeader">&ensp;&ensp;Skills</p>
      <p>&ensp;&ensp;&ensp;&ensp;HTML and CSS</p>
      <p>&ensp;&ensp;&ensp;&ensp;Javascript</p>
      <p>&ensp;&ensp;&ensp;&ensp;Excel and other spreadsheet aplications</p>
    </td>
  `;
}
