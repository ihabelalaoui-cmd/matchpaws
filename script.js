const STORAGE_KEY = "matchpaws-v1-profile";

const form = document.getElementById("matchForm");
const steps = [...document.querySelectorAll(".form-step")];
const progressItems = [...document.querySelectorAll(".progress-item")];
const bookingMessage = document.getElementById("bookingMessage");

const sitters = [
  {
    name: "Léa Martin",
    avatar: "👩🏻",
    rating: "4,9",
    bio: "Pet-sitter douce et attentive, habituée aux animaux sensibles et aux promenades urbaines.",
    tags: ["Animaux sensibles", "Promenades", "Premiers secours"],
    services: ["promenade", "visite"],
    species: ["chien", "chat"],
    temperaments: ["calme", "timide", "joueur"],
    prices: { promenade: "18 € / promenade", visite: "20 € / visite", garde: "45 € / garde" }
  },
  {
    name: "Yanis Benali",
    avatar: "👨🏽",
    rating: "4,8",
    bio: "Sportif et patient, idéal pour les chiens dynamiques et les longues sorties en extérieur.",
    tags: ["Chiens sportifs", "Grande balade", "Week-end"],
    services: ["promenade", "garde"],
    species: ["chien", "autre"],
    temperaments: ["énergique", "joueur"],
    prices: { promenade: "19 € / promenade", visite: "22 € / visite", garde: "48 € / garde" }
  },
  {
    name: "Camille Robert",
    avatar: "👩🏼",
    rating: "5,0",
    bio: "Calme et organisée, habituée aux chats, petits animaux et routines précises à domicile.",
    tags: ["Chats", "Petits animaux", "Soins & routine"],
    services: ["visite", "garde"],
    species: ["chat", "autre"],
    temperaments: ["calme", "timide"],
    prices: { promenade: "17 € / promenade", visite: "21 € / visite", garde: "44 € / garde" }
  }
];

function showStep(stepNumber) {
  steps.forEach(step => step.classList.toggle("active", Number(step.dataset.step) === stepNumber));
  progressItems.forEach(item => item.classList.toggle("active", Number(item.dataset.progress) <= stepNumber));
  document.getElementById("match").scrollIntoView({ behavior: "smooth", block: "start" });
}

function value(name) {
  const element = form.elements[name];
  if (!element) return "";
  if (element instanceof RadioNodeList) return element.value;
  return element.value;
}

function validateStep(stepNumber) {
  const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
  const required = [...step.querySelectorAll("[required]")];
  let valid = true;

  required.forEach(field => {
    if (field.type === "radio") {
      const group = [...step.querySelectorAll(`input[name="${field.name}"]`)];
      const ok = group.some(item => item.checked);
      group.forEach(item => item.closest("label")?.classList.toggle("invalid", !ok));
      if (!ok) valid = false;
    } else {
      const ok = String(field.value || "").trim() !== "";
      field.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    }
  });

  if (!valid) {
    const first = step.querySelector(".invalid");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return valid;
}

function collectData() {
  return {
    petName: value("petName").trim(),
    petAge: value("petAge"),
    species: value("species"),
    temperament: value("temperament"),
    needs: value("needs").trim(),
    service: value("service"),
    date: value("date"),
    zone: value("zone").trim()
  };
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData()));
}

function restoreLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([key, val]) => {
      if (!val || !form.elements[key]) return;
      const input = form.elements[key];
      if (input instanceof RadioNodeList) {
        [...form.querySelectorAll(`input[name="${key}"]`)].forEach(r => r.checked = r.value === val);
      } else {
        input.value = val;
      }
    });
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function chooseSitter(data) {
  let best = null;
  let bestScore = -1;

  sitters.forEach((sitter, index) => {
    let score = 78;
    if (sitter.services.includes(data.service)) score += 8;
    if (sitter.species.includes(data.species)) score += 5;
    if (sitter.temperaments.includes(data.temperament)) score += 4;
    if (data.needs) score += 1;
    score -= index;
    if (score > bestScore) {
      bestScore = score;
      best = sitter;
    }
  });

  return { sitter: best, score: Math.min(99, bestScore) };
}

function prettyDate(isoDate) {
  if (!isoDate) return "Date à confirmer";
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function renderMatch() {
  const data = collectData();
  const { sitter, score } = chooseSitter(data);

  document.getElementById("scoreValue").textContent = `${score}%`;
  document.getElementById("sitterAvatar").textContent = sitter.avatar;
  document.getElementById("sitterName").textContent = sitter.name;
  document.getElementById("sitterRating").textContent = sitter.rating;
  document.getElementById("sitterBio").textContent = sitter.bio;
  document.getElementById("sitterTags").innerHTML = sitter.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
  document.getElementById("detailZone").textContent = data.zone;
  document.getElementById("detailDate").textContent = prettyDate(data.date);
  document.getElementById("detailPrice").textContent = sitter.prices[data.service];
  document.getElementById("resultIntro").textContent = `${data.petName || "Ton animal"} a un profil qui correspond particulièrement bien à ${sitter.name}.`;

  const reasons = [
    `${sitter.name} accepte le service « ${data.service} » demandé.`,
    `Son expérience correspond bien au profil ${data.temperament} de ${data.petName}.`,
    `Elle/il intervient sur une zone compatible avec « ${data.zone} » dans cette démonstration.`
  ];
  if (data.needs) reasons.push("Tes besoins particuliers sont pris en compte dans l’explication du match.");
  document.getElementById("whyList").innerHTML = reasons.map(r => `<li>${r}</li>`).join("");

  bookingMessage.classList.remove("show");
  bookingMessage.textContent = "";
}

document.querySelectorAll("[data-next]").forEach(btn => {
  btn.addEventListener("click", () => {
    const current = Number(btn.closest(".form-step").dataset.step);
    if (!validateStep(current)) return;
    saveLocal();
    showStep(Number(btn.dataset.next));
  });
});

document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showStep(Number(btn.dataset.back)));
});

document.getElementById("findMatchBtn").addEventListener("click", () => {
  if (!validateStep(2)) return;
  saveLocal();
  renderMatch();
  showStep(3);
});

document.getElementById("bookingBtn").addEventListener("click", () => {
  const data = collectData();
  bookingMessage.textContent = `✅ Demande simulée envoyée pour ${data.petName}. Dans une vraie version, cette étape nécessiterait un compte, une messagerie et un backend sécurisé.`;
  bookingMessage.classList.add("show");
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  bookingMessage.classList.remove("show");
  showStep(1);
});

form.addEventListener("input", event => {
  const field = event.target;
  field.classList?.remove("invalid");
  field.closest("label")?.classList.remove("invalid");
  saveLocal();
});

const dateInput = document.getElementById("date");
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dateInput.min = `${yyyy}-${mm}-${dd}`;

restoreLocal();