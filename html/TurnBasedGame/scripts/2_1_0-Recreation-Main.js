let entityMgr = new EntityManager();
let dispatch = new MessageDispatcher();

entityMgr.registerEntity(new MenuMngr(battleLogTxt));
entityMgr.registerEntity(new Player());
entityMgr.registerEntity(new Opponent());

let menuID = 0, playerID = 1, opponentID = 2;

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
