
type Lang = "en" | "fr" | "es";

const LANGUAGE_STORAGE_KEY = "language";
const DEFAULT_LANG: Lang = "en";

const FLAG_BY_LANG: Record<Lang, { src: string; alt: string; aria: string }> = {
  en: {
    src: "/assets/flags/en.svg",
    alt: "Current language: English",
    aria: "Change language (current: English)",
  },
  fr: {
    src: "/assets/flags/fr.svg",
    alt: "Langue actuelle : Français",
    aria: "Changer de langue (actuelle : Français)",
  },
  es: {
    src: "/assets/flags/es.svg",
    alt: "Idioma actual: Español",
    aria: "Cambiar idioma (actual: Español)",
  },
};


function setLanguagePreference(lang: Lang) {

	// TODO: Change this to set the changement in database
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

function getStoredLang(): Lang {
  const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang | null;
  return (raw && FLAG_BY_LANG[raw]) ? raw : DEFAULT_LANG;
}

function updateContent(languageData: Record<string, string>, lang: string) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && languageData[key]) {
            element.innerHTML = languageData[key];
        }
    });

    const htmlLangAttribute = document.querySelector('html');
    if (htmlLangAttribute) {
        htmlLangAttribute.setAttribute('lang', lang);
    }
}

function updateFlagUI(lang: Lang): void {
  const flag = document.getElementById("current-language-flag") as HTMLImageElement | null;
  const btn = document.getElementById("language-button-navbar") as HTMLButtonElement | null;
  if (!flag || !btn) return;

  const meta = FLAG_BY_LANG[lang];
  flag.src = meta.src;
  flag.alt = meta.alt;
  btn.setAttribute("aria-label", meta.aria);
}




async function fetchLanguageData(lang: Lang) {
    const response = await fetch(`src/lang/languages/${lang}.json`);
    return response.json();
}

export async function changeLanguage(lang: Lang) {

	setLanguagePreference(lang);

	const languageData = await fetchLanguageData(lang);

	updateContent(languageData, lang);
}

function markActiveOption(lang: Lang): void {
  document.querySelectorAll<HTMLButtonElement>("#dropdown-language .lang-opt").forEach(opt => {
    const isActive = opt.dataset.lang === lang;
    opt.setAttribute("aria-checked", String(isActive));
    const check = opt.querySelector<HTMLElement>(".check");
    if (check) check.classList.toggle("hidden", !isActive);
    opt.classList.toggle("bg-white/10", isActive);
    opt.classList.toggle("text-white", isActive);
  });
}

async function applyLanguage(lang: Lang): Promise<void> {
  setLanguagePreference(lang);
  updateFlagUI(lang);
  markActiveOption(lang);
  try {
    await changeLanguage(lang);
  } catch (e) {
    console.error("[i18n] changeLanguage failed:", e);
  }
}

function openDropdown(): void {
  const dd = document.getElementById("dropdown-language");
  dd?.classList.remove("hidden", "animate-slide-down");
  dd?.classList.add("animate-slide-up");
}

function closeDropdown(): void {
  const dd = document.getElementById("dropdown-language");

  dd?.classList.remove("animate-slide-up");
  dd?.classList.add("animate-slide-down");

  setTimeout(() => {
	  dd?.classList.add("hidden");
  }, 300);
}

function isDropdownOpen(): boolean {
  return !document.getElementById("dropdown-language")?.classList.contains("hidden");
}

function focusFirstOption(): void {
  const first = document.querySelector<HTMLButtonElement>("#dropdown-language .lang-opt");
  first?.focus();
}

export function initLanguageDropdown(): void {
  const btn = document.getElementById("language-button-navbar");
  const dd = document.getElementById("dropdown-language");
  if (!btn || !dd) return;


  // Init UI selon la langue stockée
  const initial = getStoredLang();
  updateFlagUI(initial);
  markActiveOption(initial);

  // Toggle dropdown
  btn.addEventListener("click", (e) => {
    if (isDropdownOpen()) closeDropdown();
    else {
      openDropdown();
      // Focus clavier
      setTimeout(focusFirstOption, 0);
    }
  });

  // Sélection d'une langue
  dd.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>(".lang-opt");
    if (!target) return;
    const lang = target.dataset.lang as Lang | undefined;
    if (lang && FLAG_BY_LANG[lang]) {
      void applyLanguage(lang);
      closeDropdown();
      (btn as HTMLElement).focus();
    }
  });

  // Navigation clavier
  dd.addEventListener("keydown", (e: KeyboardEvent) => {
    const opts = Array.from(dd.querySelectorAll<HTMLButtonElement>(".lang-opt"));
    const currentIndex = opts.findIndex((el) => el === document.activeElement);
    if (e.key === "Escape") {
      closeDropdown();
      (btn as HTMLElement).focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = opts[(currentIndex + 1 + opts.length) % opts.length];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = opts[(currentIndex - 1 + opts.length) % opts.length];
      prev?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const focused = document.activeElement as HTMLButtonElement | null;
      const lang = focused?.dataset.lang as Lang | undefined;
      if (lang && FLAG_BY_LANG[lang]) {
        void applyLanguage(lang);
        closeDropdown();
        (btn as HTMLElement).focus();
      }
    }
  });

  // Fermer au clic extérieur
  document.addEventListener("click", (e) => {
    const within = (e.target as Node) && (btn.contains(e.target as Node) || dd.contains(e.target as Node));
    if (!within) closeDropdown();
  });

  // Fermer sur resize (optionnel)
  window.addEventListener("resize", closeDropdown);
}

// for the language management
export async function language_manager() {
		// TODO: changer ca par un appel api qui connait la langue de l'user
    const userPreferredLanguage = getStoredLang();
	
    const langData = await fetchLanguageData(userPreferredLanguage);
    updateContent(langData, userPreferredLanguage);

	initLanguageDropdown();
}