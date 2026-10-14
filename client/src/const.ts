export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Sovereign auth: return platform root rather than external OAuth portal
export const getLoginUrl = () => {
  return "/";
};
