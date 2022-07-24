const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

const NUMBER_OF_THE_REACTION = 0;
const URL_OF_CHAT = "#-552521556" && "#-1786724046";
const TARGET_NAME = "Блок Пенопласта" && "Simon Ulybyshev";

class Flag {
  _state = false;
  _lastId = 2 ** 16;

  endProcess() {
    this._state = false;
  }

  startProcess() {
    this._state = true;
  }

  setLastId(value) {
    this._lastId = value;
  }

  isProcess() {
    return this._state;
  }

  getLastId() {
    return this._lastId;
  }
}

const hasClass = async (webElement, className) => {
  const classList = await webElement.getAttribute("class");
  return classList.split(" ").some((item) => item === className);
};

const delay = (second) => {
  return new Promise((resolve) => {
    setTimeout(resolve, second * 1000);
  });
};

(async function helloSelenium() {
  const driver = await new Builder().forBrowser("chrome").build();

  const setEmojiOnMessage = async (webElement) => {
    await driver.actions().contextClick(webElement).perform();

    await delay(1);

    const webItemReaction = await driver.findElements(
      By.className("ReactionSelectorReaction")
    );

    await driver
      .actions()
      .click(webItemReaction[NUMBER_OF_THE_REACTION])
      .perform();
  };

  await driver.get("https://web.telegram.org");

  await driver.wait(until.urlContains(URL_OF_CHAT));

  await driver.get(`https://web.telegram.org/z/${URL_OF_CHAT}`);

  console.log("Ready to start in 5 seconds");
  await delay(5);

  const flag = new Flag();

  while (true) {
    const webElements = await driver.findElements(By.className("Message"));

    for (let index = webElements.length - 1; index >= 0; index--) {
      const messageId = await webElements[index].getAttribute(
        "data-message-id"
      );
      if (messageId >= flag.getLastId()) continue;

      const isOwn = await hasClass(webElements[index], "own");
      if (isOwn) continue;

      if (flag.isProcess()) {
        await setEmojiOnMessage(webElements[index], driver);

        const isFirst = await hasClass(webElements[index], "first-in-group");
        if (isFirst) flag.endProcess();

        continue;
      }

      const isLast = await hasClass(webElements[index], "last-in-group");
      if (!isLast) continue;

      const avatar = await webElements[index].findElement(By.css("img"));
      const altName = await avatar.getAttribute("alt");

      if (altName === TARGET_NAME) {
        await setEmojiOnMessage(webElements[index], driver);

        const isFirst = await hasClass(webElements[index], "first-in-group");
        if (!isFirst) flag.startProcess();
      }
    }

    const lastId = await webElements[0].getAttribute("data-message-id");
    flag.setLastId(lastId);

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      webElements[0]
    );
    await delay(2);
  }
})();
