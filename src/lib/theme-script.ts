/**
 * Runs in <head> before the page paints so the saved theme is applied
 * without a flash. The page renders dark by default.
 */
export const themeInitScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}`;
