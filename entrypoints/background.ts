export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  browser.action.onClicked.addListener(async () => {
    await browser.tabs.create({ url: "/sync.html" });
  });
});
