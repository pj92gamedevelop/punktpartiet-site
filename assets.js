// ===== Menu (dropdown) =====
const menuBtn = document.getElementById("menuBtn");
const moreMenu = document.getElementById("moreMenu");

function openMenu() {
  moreMenu.classList.add("is-open");
  menuBtn.setAttribute("aria-expanded", "true");
}
function closeMenu() {
  moreMenu.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
}
function toggleMenu() {
  const isOpen = moreMenu.classList.contains("is-open");
  if (isOpen) closeMenu();
  else openMenu();
}

menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

document.addEventListener("click", (e) => {
  if (!moreMenu || !menuBtn) return;
  const clickedInside = moreMenu.contains(e.target) || menuBtn.contains(e.target);
  if (!clickedInside) closeMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
    closeMemberModal();
  }
});

// ===== Member modal =====
const openMemberBtn = document.getElementById("openMemberBtn");
const openMemberBtn2 = document.getElementById("openMemberBtn2");
const openMemberBtn3 = document.getElementById("openMemberBtn3");
const closeMemberBtn = document.getElementById("closeMemberBtn");
const cancelMemberBtn = document.getElementById("cancelMemberBtn");

const memberModal = document.getElementById("memberModal");
const memberBackdrop = document.getElementById("memberModalBackdrop");

function openMemberModal() {
  if (!memberModal || !memberBackdrop) return;
  memberBackdrop.hidden = false;
  memberModal.hidden = false;
  document.body.style.overflow = "hidden";
  closeMenu();
}

function closeMemberModal() {
  if (!memberModal || !memberBackdrop) return;
  memberBackdrop.hidden = true;
  memberModal.hidden = true;
  document.body.style.overflow = "";
  const status = document.getElementById("memberFormStatus");
  if (status) status.textContent = "";
}

openMemberBtn?.addEventListener("click", openMemberModal);
openMemberBtn2?.addEventListener("click", openMemberModal);
openMemberBtn3?.addEventListener("click", openMemberModal);
closeMemberBtn?.addEventListener("click", closeMemberModal);
cancelMemberBtn?.addEventListener("click", closeMemberModal);

memberBackdrop?.addEventListener("click", closeMemberModal);

// ===== Form submit -> Cloudflare Worker endpoint -> Resend =====
const memberForm = document.getElementById("memberForm");
const statusEl = document.getElementById("memberFormStatus");
const submitBtn = document.getElementById("submitMemberBtn");

// TODO: ändra till din riktiga endpoint när Workern är på plats
// Ex: https://api.punktpartiet.se/member
const MEMBER_ENDPOINT = "https://api.punktpartiet.se/member";

memberForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!statusEl || !submitBtn) return;

  statusEl.textContent = "Skickar…";
  submitBtn.disabled = true;

  const formData = new FormData(memberForm);
  const payload = {
    firstName: (formData.get("firstName") || "").toString().trim(),
    lastName: (formData.get("lastName") || "").toString().trim(),
    email: (formData.get("email") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
    city: (formData.get("city") || "").toString().trim(),
    message: (formData.get("message") || "").toString().trim(),
    source: "punktpartiet.se",
  };

  try {
    const res = await fetch(MEMBER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      statusEl.textContent = data?.error || "Något gick fel. Försök igen.";
      submitBtn.disabled = false;
      return;
    }

    statusEl.textContent = "Tack! Vi hör av oss inom kort.";
    memberForm.reset();

    // Optional: stäng efter en liten stund
    setTimeout(() => closeMemberModal(), 900);

  } catch (err) {
    statusEl.textContent = "Nätverksfel. Försök igen.";
  } finally {
    submitBtn.disabled = false;
  }
});
