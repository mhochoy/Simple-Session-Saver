// app.js

function onSessionSaverClick(context) {
    switch(context.menuItemId) {
        case 'save':
          setAllTabs();
          break;
        case 'open':
          openAllTabs();
          break;
        default:
          break;
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
              SendNotification("Note", "Skipped an already open page.")
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
          SendNotification("Error!", "There are no saved tabs to open.")
        }
        else {
          console.log(e);
        }
    }
    
}

function SendNotification(title, message) {
  chrome.notifications.create('sessionsaver', 
      {'title': title, 
        'message': message,
        'type': "basic",
        'iconUrl': "img/64x64.png"},
      function () {});
}