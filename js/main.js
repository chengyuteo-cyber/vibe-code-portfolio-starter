const content = window.portfolioData;

if (!content) {
  throw new Error("Portfolio content is missing. Check that js/data.js loads before js/main.js.");
}

document.querySelectorAll("[data-content]").forEach((element) => {
  const key = element.dataset.content;
  if (Object.hasOwn(content, key)) {
    element.textContent = content[key];
  }
});

const heroName = document.getElementById("hero-name");
const nameAccent = document.createElement("span");
nameAccent.className = "hero-period";
nameAccent.textContent = ".";
heroName.replaceChildren(document.createTextNode(content.name), nameAccent);

const navList = document.getElementById("nav-links");
navList.replaceChildren(...content.navigation.map(({ label, href }) => {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  item.append(link);
  return item;
}));

const navToggle = document.getElementById("nav-menu-toggle");
const navLinks = document.getElementById("nav-links");

function setMenuOpen(isOpen) {
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  navLinks.classList.toggle("is-open", isOpen);
}

navToggle.addEventListener("click", () => {
  setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

const projectSearch = document.getElementById("portfolio-search");
const searchStatus = document.getElementById("search-status");
const searchableItems = [
  ...document.querySelectorAll(".project-card, .skills-list li")
];

projectSearch.form.addEventListener("submit", (event) => {
  event.preventDefault();
});

projectSearch.addEventListener("input", () => {
  const query = projectSearch.value.trim().toLocaleLowerCase();
  let visibleProjects = 0;
  let visibleSkills = 0;

  searchableItems.forEach((item) => {
    const matches = !query || item.textContent.toLocaleLowerCase().includes(query);
    item.hidden = !matches;

    if (matches && item.matches(".project-card")) {
      visibleProjects += 1;
    } else if (matches) {
      visibleSkills += 1;
    }
  });

  if (!query) {
    searchStatus.textContent = "";
    return;
  }

  const resultCount = visibleProjects + visibleSkills;
  searchStatus.textContent = resultCount
    ? `${resultCount} match${resultCount === 1 ? "" : "es"} across projects and skills.`
    : "No matches yet. Try another keyword.";
});

const commandTrigger = document.getElementById("command-trigger");
const commandDialog = document.getElementById("command-dialog");
const commandClose = document.getElementById("command-close");
const commandSearch = document.getElementById("command-search");
const commandList = document.getElementById("command-list");
const commandShortcut = document.getElementById("command-shortcut");
const isMac = navigator.platform.toLowerCase().includes("mac");
commandShortcut.textContent = isMac ? "⌘ K" : "Ctrl K";

function renderCommands() {
  commandList.replaceChildren(...content.commands.map((command) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const label = document.createElement("span");
    const shortcut = document.createElement("kbd");

    button.type = "button";
    button.className = "command-item";
    label.textContent = command.label;
    shortcut.textContent = command.shortcut;
    button.append(label, shortcut);
    button.addEventListener("click", () => {
      commandDialog.close();

      if (command.href) {
        window.location.hash = command.href;
      } else if (command.action === "search") {
        projectSearch.focus();
        projectSearch.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (command.action === "theme") {
        toggle.click();
      }
    });

    item.append(button);
    return item;
  }));
}

renderCommands();

function openCommandPalette() {
  if (!commandDialog.open) {
    commandSearch.value = "";
    commandList.querySelectorAll("li").forEach((item) => {
      item.hidden = false;
    });
    commandDialog.showModal();
    commandSearch.focus();
  }
}

commandTrigger.addEventListener("click", openCommandPalette);
commandClose.addEventListener("click", () => commandDialog.close());
commandDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    commandDialog.close();
  }
});
commandSearch.addEventListener("input", () => {
  const query = commandSearch.value.trim().toLocaleLowerCase();
  commandList.querySelectorAll("li").forEach((item) => {
    item.hidden = !item.textContent.toLocaleLowerCase().includes(query);
  });
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();

    if (commandDialog.open) {
      commandDialog.close();
    } else {
      openCommandPalette();
    }
  }
});

const toggle = document.getElementById("theme-toggle");
const themeIcon = toggle.querySelector(".theme-icon");
const root = document.documentElement;

function setTheme(theme) {
  const isDark = theme === "dark";
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  themeIcon.textContent = isDark ? "☀" : "☾";
  toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (error) {
    // The theme still works for this visit when browser storage is unavailable.
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (error) {
  // Use the system preference when browser storage is unavailable.
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));

toggle.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      sectionLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-25% 0px -60% 0px" });

  sections.forEach((section) => sectionObserver.observe(section));
}

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}
