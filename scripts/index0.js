let btn = document.getElementById("menuBtn");

btn.addEventListener("click", function() {
  let panel = document.getElementsByClassName("mainNav");
  if (panel[0].style.maxHeight) {
    panel[0].style.maxHeight = null;
  } else {
    panel[0].style.maxHeight = panel[0].scrollHeight + "px";
  }
});

function getPage(str) {
  document.getElementById("projectCell").innerHTML = `
    <iframe src="html\\${str}"></iframe>
  `
}

function displayProjects() {
  infoRow.innerHTML = `
    <td id="projectNavigation">
      <button class="projectAccordian">Computer Graphics</button>
      <div class="projectPanel">
        <div onclick="getPage('ComputerGraphics\\\\html\\\\introduction.html')"><p>Introduction</p></div>
        <div onclick="getPage('ComputerGraphics\\\\html\\\\linearAlgebra.html')"><p>Linear Algebra</p></div>
        <div onclick="getPage('ComputerGraphics\\\\html\\\\canvas1.html')"><p>Drawing to the canvas</p></div>
        <div onclick="getPage('ComputerGraphics\\\\html\\\\learningWebGL.html')"><p>WebGL</p></div>
      </div>
      <button class="projectAccordian">Turn-based Game</button>
      <div class="projectPanel">
        <div onclick="getPage('TurnBasedGame\\\\html\\\\introduction.html')"><p>Introduction</p></div>
        <div onclick="getPage('TurnBasedGame\\\\html\\\\1_0-Recreation.html')"><p>Recreation</p></div>
        <div onclick="getPage('TurnBasedGame\\\\html\\\\2_0-Recreation.html')"><p>More Combat</p></div>
      </div>
      <button class="projectAccordian">Engineering</button>
      <div class="projectPanel">
        <p>Project3</p>
      </div>
    </td>
    <td id="projectCell">
    </td>
  `

  let acc = document.getElementsByClassName("projectAccordian");

  // Accordian code for the nested projects
  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      let panel = this.nextElementSibling;
      if(panel.style.maxHeight) {
        panel.style.maxHeight = null;
        panel.style.border = null;
      }
      else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.style.border = "1px solid lightgrey";
      }
    });
  }
}

function displayAboutMe() {
  infoRow.innerHTML = `
    <td>
      <p class="infoHeader">&ensp;&ensp;Experience</p>
      <div class="infoDiv">
      <p>&ensp;&ensp;&ensp;&ensp;2020 - Present&ensp;&ensp;<b>PlateRoom Operator</b></p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;Dow Jones & Company, Inc.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Adequately prepared plates to be put on the press.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Ensured the quality of the plates by observing no scratches or blemishes.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Rectify minor mechanical errors occuring in production.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Maintain accurate data into analysis software.</p>
      <p>&ensp;&ensp;&ensp;&ensp;2019-2020&emsp;&emsp;&emsp;<b>Supplemental Instruction Leader</b></p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;Springfield Technical Community College</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Develop and maintain a relationship with students.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Maintain pace with specified classes in order to better assist students seeking assistance.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Guided students both in and out of class with course work.</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Organized individual and group meetings with students.</p>
      </div>
      <p class="infoHeader">&ensp;&ensp;Education</p>
      <div class="infoDiv">
      <p>&ensp;&ensp;&ensp;&ensp;2018 - 2020&ensp;&emsp;&emsp;<b>Assoc, Computer Science, Springfield Technical Community College</b></p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Pursued a passion for programming</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Excelled in both C++ and Java classes</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&#8226;&emsp;Impressed a professor so much, he said I didn't need to take the final.</p>
      <p>&ensp;&ensp;&ensp;&ensp;2013 - 2017&ensp;&emsp;&emsp;<b>BA, Mechanical Engineering, Western New England University</b></p>
      </div>
      <p class="infoHeader">&ensp;&ensp;Skills</p>
      <div class="infoDiv">
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;HTML and CSS</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;Javascript</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;C++</p>
      <p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;Excel and other spreadsheet aplications</p>
      </div>
    </td>
  `;
}
