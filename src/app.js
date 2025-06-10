// app.js

function onSessionSaverClick(context) {
    switch(context.menuItemId) {
        case 'save':
          setAllTabs();
          console.log("Saving tabs...");
          break;
        case 'open':
          openAllTabs();
          console.log("Opening tabs...")
          break;
        default:
          console.log("No option for default: Session Saver")
    }
}

chrome.contextMenus.onClicked.addListener(onSessionSaverClick);
chrome.commands.onCommand.addListener(
  (command) => {
    if (!["save", "open"].includes(command)) {
      return;
    }
    if (command === "save") {
      setAllTabs();
    }

    if (command === "open") {
      openAllTabs();
    }
  }
)

chrome.runtime.onInstalled.addListener(() => {
    let buttons = [
      'Save',
      'Open'
    ]
    chrome.tabs.create({
      url: "index.html"
    });

    const parent = chrome.contextMenus.create({
      title: "Session Saver",
      id: 'parent'
    });

    for (let i = 0; i< buttons.length; i++) {
      let name = buttons[i];

      chrome.contextMenus.create({
        title: name,
        parentId: 'parent',
        id: name.toLowerCase(),
      })
    }
});

async function setAllTabs() {
    const window = await chrome.windows.getCurrent({ populate: true });

    console.log(window.tabs);

    chrome.storage.local.set({ 
      "savedTabs": window.tabs 
    });
}

async function getAllTabs() {
    const tabs = await chrome.storage.local.get("savedTabs");
    return tabs;
}

async function openAllTabs() {
    const tabs = await getAllTabs();

    try {
        for (let tab of tabs["savedTabs"]) {
          let open = chrome.tabs.query({"url": tab.url}, function (result) {
            if (result[0] && tab.url === result[0].url) {
              console.log("This tab is already open");
            }
            else {
              chrome.tabs.create({
                url: tab.url
              });
            }
          });
        }
    }
    catch (e) {
        if (e instanceof TypeError) {
          console.log("There are no saved tabs to open: ", e);

          chrome.notifications.create('notabs', 
            {'title': "Error!", 
              'message': "There are no saved tabs to open",
              'type': "basic",
              'iconUrl': "img/64x64.png"},
            function () {});
        }
        else {
          console.log(e);
        }
    }
    
}