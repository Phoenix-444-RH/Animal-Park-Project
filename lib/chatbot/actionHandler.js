export async function executeChatbotAction({ router, action, closeWidget }) {
  if (!action || action.type !== "route") return null;
  if (typeof closeWidget === "function") closeWidget();
  await router.push({ pathname: action.pathname, query: action.query || {} });
  return action.pathname;
}
