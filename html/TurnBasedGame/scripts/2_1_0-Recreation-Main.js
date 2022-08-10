let entityMgr = new EntityManager();
let dispatch = new MessageDispatcher();

entityMgr.registerEntity(new MenuMngr(battleLogTxt));
entityMgr.registerEntity(new Player());
entityMgr.registerEntity(new Opponent());

let menuID = 0, playerID = 1, opponentID = 2;
opponentHealthPoints.innerHTML = `${entityMgr.getEntityById(opponentID).getCurrentHP()}/${entityMgr.getEntityById(opponentID).getHP()}`;
playerHealthPoints.innerHTML = `${entityMgr.getEntityById(playerID).getCurrentHP()}/${entityMgr.getEntityById(playerID).getHP()}`;
playerHealthBar.style.width = `${entityMgr.getEntityById(playerID).getCurrentHP() / entityMgr.getEntityById(playerID).getHP() * 100 + 1}%`;
opponentHealthBar.style.width = `${entityMgr.getEntityById(opponentID).getCurrentHP() / entityMgr.getEntityById(opponentID).getHP() * 100 + 1}%`;

entityMgr.getEntityById(0).changeState(new PlayerAttackMenu());
maneuverSelections.forEach(e => {
  e.addEventListener("click", function() {
    dispatch.dispatchMessage(menuID, playerID, 0, "msg_selectionMade", e.innerHTML.split('>')[1]);
    entityMgr.getEntityById(menuID).getFSM().update();
  });
});

battleLogFieldSet.addEventListener("click", function() {
  entityMgr.getEntityById(menuID).getFSM().update();
});
