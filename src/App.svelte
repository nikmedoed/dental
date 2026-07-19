<script>
  import { onMount } from "svelte";
  import { Check } from "@lucide/svelte";
  import Sidebar from "./components/layout/Sidebar.svelte";
  import Topbar from "./components/layout/Topbar.svelte";
  import MobileNav from "./components/layout/MobileNav.svelte";
  import Dashboard from "./components/pages/Dashboard.svelte";
  import HistoryPage from "./components/pages/HistoryPage.svelte";
  import EpisodesPage from "./components/pages/EpisodesPage.svelte";
  import ReportsPage from "./components/pages/ReportsPage.svelte";
  import LoginScreen from "./components/screens/LoginScreen.svelte";
  import SharedReport from "./components/screens/SharedReport.svelte";
  import SplashScreen from "./components/screens/SplashScreen.svelte";
  import AddEventModal from "./components/modals/AddEventModal.svelte";
  import DataModal from "./components/modals/DataModal.svelte";
  import EventModal from "./components/modals/EventModal.svelte";
  import ShareModal from "./components/modals/ShareModal.svelte";
  import ToothDrawer from "./components/modals/ToothDrawer.svelte";
  import { DEFAULT_CURRENCIES, DEFAULT_TOOTH } from "./lib/dental-data.js";
  import { SEED_CLINICS, SEED_DOCTORS, SEED_EVENTS } from "@personal-data";
  import {
    createPublicShare,
    firebaseEnabled,
    loginWithGoogle,
    logout as logoutFirebase,
    observeAuth,
    readPublicShare,
    replaceCloudEvents,
    saveCloudDirectories,
    saveCloudEvent,
    subscribeToDirectories,
    subscribeToEvents,
  } from "./lib/firebase.js";

  let events = SEED_EVENTS;
  let clinics = SEED_CLINICS;
  let doctors = SEED_DOCTORS;
  let currencies = DEFAULT_CURRENCIES;
  let page = "dashboard";
  let modal = null;
  let selectedTooth = DEFAULT_TOOTH;
  let selectedEvent = null;
  let user = firebaseEnabled
    ? null
    : { uid: "local", displayName: "Пользователь" };
  let authReady = !firebaseEnabled;
  let authError = "";
  let cloudConnected = false;
  let sharedData = null;
  let sharedLoading = false;
  let toast = "";
  let unsubscribeCloud = () => {};
  let unsubscribeDirectories = () => {};

  onMount(() => {
    loadLocalEvents();
    loadLocalDirectories();
    loadSharedView();

    const stopAuth = firebaseEnabled ? observeAuth(connectUser) : () => {};
    const closeOnEscape = (event) => event.key === "Escape" && closeModal();
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      stopAuth();
      unsubscribeCloud();
      unsubscribeDirectories();
      window.removeEventListener("keydown", closeOnEscape);
    };
  });

  function loadLocalEvents() {
    try {
      const saved = localStorage.getItem("denta-events");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const isOldDemo = parsed.some((event) =>
        ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"].includes(event.id),
      );
      const seedVersion = Number(
        localStorage.getItem("denta-seed-version") || 0,
      );
      const correctedSeedIds =
        seedVersion < 5
          ? new Set(["complaints-2026-04-30", "denova-treatment-2026-05-22"])
          : new Set();
      const currentEvents = isOldDemo
        ? []
        : parsed.filter((event) => !correctedSeedIds.has(event.id));
      events =
        seedVersion < 5
          ? [
              ...SEED_EVENTS.filter(
                (seedEvent) =>
                  !currentEvents.some((event) => event.id === seedEvent.id),
              ),
              ...currentEvents,
            ]
          : currentEvents;
      if (isOldDemo || seedVersion < 5) {
        localStorage.setItem("denta-events", JSON.stringify(events));
        localStorage.setItem("denta-seed-version", "5");
      }
    } catch {}
  }

  function loadLocalDirectories() {
    try {
      const saved = localStorage.getItem("denta-directories");
      if (!saved) return;
      const directories = JSON.parse(saved);
      const oldClinicIds = [
        "white-line",
        "artdent",
        "nova-dental",
        "smile-lab",
      ];
      const hasOldDemo = (directories.clinics || []).some((clinic) =>
        oldClinicIds.includes(clinic.id),
      );
      clinics = hasOldDemo ? SEED_CLINICS : directories.clinics || SEED_CLINICS;
      doctors = hasOldDemo ? SEED_DOCTORS : directories.doctors || SEED_DOCTORS;
      currencies = directories.currencies || DEFAULT_CURRENCIES;
      if (hasOldDemo) {
        localStorage.setItem(
          "denta-directories",
          JSON.stringify({ clinics, doctors, currencies }),
        );
      }
    } catch {}
  }

  function loadSharedView() {
    const token = new URLSearchParams(location.hash.replace(/^#\/?/, "")).get(
      "share",
    );
    if (!token) return;
    sharedLoading = true;
    readPublicShare(token).then((result) => {
      sharedData = result || { expired: true, events: [] };
      sharedLoading = false;
    });
  }

  async function connectUser(nextUser) {
    user = nextUser;
    authReady = true;
    unsubscribeCloud();
    unsubscribeDirectories();
    cloudConnected = false;
    if (!nextUser) return;

    unsubscribeCloud = subscribeToEvents(nextUser.uid, (cloudEvents) => {
      persist(cloudEvents);
      cloudConnected = true;
    });
    unsubscribeDirectories = subscribeToDirectories(
      nextUser.uid,
      persistDirectories,
    );
  }

  function persist(nextEvents) {
    events = nextEvents;
    localStorage.setItem("denta-events", JSON.stringify(events));
  }

  function persistDirectories(directories) {
    clinics = directories.clinics || clinics;
    doctors = directories.doctors || doctors;
    currencies = directories.currencies || currencies;
    localStorage.setItem(
      "denta-directories",
      JSON.stringify({ clinics, doctors, currencies }),
    );
  }

  function navigate(nextPage) {
    page = nextPage;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeModal() {
    modal = null;
  }

  function openAdd(tooth = null) {
    selectedTooth = tooth;
    modal = "add";
  }

  function openTooth(tooth) {
    selectedTooth = tooth;
    modal = "tooth";
  }

  function openEvent(event) {
    selectedEvent = event;
    modal = "event";
  }

  async function saveEvent({
    event,
    newClinic,
    newDoctor,
    updatedDoctor,
    newCurrency,
  }) {
    const nextClinics = newClinic ? [...clinics, newClinic] : clinics;
    const nextDoctors = newDoctor
      ? [...doctors, newDoctor]
      : updatedDoctor
        ? doctors.map((doctor) =>
            doctor.id === updatedDoctor.id ? updatedDoctor : doctor,
          )
        : doctors;
    const nextCurrencies = newCurrency
      ? [...currencies, newCurrency]
      : currencies;
    if (newClinic || newDoctor || updatedDoctor || newCurrency) {
      persistDirectories({
        clinics: nextClinics,
        doctors: nextDoctors,
        currencies: nextCurrencies,
      });
    }
    persist([event, ...events]);
    if (firebaseEnabled && user) {
      await saveCloudEvent(user.uid, event);
      if (newClinic || newDoctor || updatedDoctor || newCurrency) {
        await saveCloudDirectories(user.uid, {
          clinics: nextClinics,
          doctors: nextDoctors,
          currencies: nextCurrencies,
        });
      }
    }
    closeModal();
    showToast("Запись добавлена");
  }

  async function resolveComplaint(tooth) {
    const event = {
      id: `complaint-resolved-${Date.now()}`,
      type: "complaint",
      kind: "complaint_resolved",
      date: new Date().toISOString().slice(0, 10),
      title: "Жалоба снята",
      notes: "",
      items: [
        {
          id: crypto.randomUUID(),
          tooth,
          kind: "complaint_resolved",
          status: "resolved",
          title: "Жалоба снята",
          notes: "",
          surfaces: [],
          attachments: [],
        },
      ],
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    persist([event, ...events]);
    if (firebaseEnabled && user) await saveCloudEvent(user.uid, event);
    showToast(`Жалоба по зубу ${tooth} снята`);
  }

  async function importData(data) {
    persist(data.events);
    persistDirectories({
      clinics: data.clinics || clinics,
      doctors: data.doctors || doctors,
      currencies: data.currencies || currencies,
    });
    if (firebaseEnabled && user) {
      await replaceCloudEvents(user.uid, data.events);
      await saveCloudDirectories(user.uid, {
        clinics: data.clinics || clinics,
        doctors: data.doctors || doctors,
        currencies: data.currencies || currencies,
      });
    }
  }

  async function createShare(duration) {
    const result = await createPublicShare(user?.uid, events, duration);
    return `${location.origin}${location.pathname}#/share=${result.token}`;
  }

  async function signIn() {
    authError = "";
    try {
      await loginWithGoogle();
    } catch (error) {
      const messages = {
        "auth/unauthorized-domain":
          "Этот домен не разрешён в Firebase Authentication → Settings → Authorized domains.",
        "auth/operation-not-allowed":
          "В Firebase Authentication не включён способ входа Google.",
        "auth/popup-blocked":
          "Браузер заблокировал окно входа Google. Разрешите всплывающие окна и повторите попытку.",
        "auth/popup-closed-by-user": "Окно входа Google было закрыто.",
      };
      authError =
        messages[error?.code] ||
        `Не удалось войти через Google${error?.code ? ` (${error.code})` : ""}.`;
    }
  }

  function showToast(message) {
    toast = message;
    setTimeout(() => (toast = ""), 2200);
  }
</script>

<svelte:head><title>Denta — личная история лечения</title></svelte:head>

{#if sharedLoading || (firebaseEnabled && !authReady)}
  <SplashScreen />
{:else if sharedData}
  <SharedReport data={sharedData} />
{:else if firebaseEnabled && !user}
  <LoginScreen onSignIn={signIn} error={authError} />
{:else}
  <div class="app-shell">
    <Sidebar
      {page}
      eventsCount={events.length}
      {user}
      {firebaseEnabled}
      onNavigate={navigate}
      onShare={() => (modal = "share")}
      onData={() => (modal = "data")}
      onLogout={logoutFirebase}
    />
    <main class="main">
      <Topbar
        {page}
        {firebaseEnabled}
        {cloudConnected}
        onNavigate={navigate}
        onAdd={() => openAdd()}
      />
      {#if page === "dashboard"}
        <Dashboard
          {events}
          onAdd={openAdd}
          onShare={() => (modal = "share")}
          onOpenTooth={openTooth}
          onOpenEvent={openEvent}
          onNavigate={navigate}
        />
      {:else if page === "history"}
        <HistoryPage {events} onAdd={openAdd} onOpenEvent={openEvent} />
      {:else if page === "episodes"}
        <EpisodesPage {events} onOpenEvent={openEvent} />
      {:else}
        <ReportsPage
          {events}
          onShare={() => (modal = "share")}
          onData={() => (modal = "data")}
        />
      {/if}
    </main>
    <MobileNav {page} onNavigate={navigate} onAdd={() => openAdd()} />

    {#if modal === "add"}
      <AddEventModal
        initialTooth={selectedTooth}
        {clinics}
        {doctors}
        {currencies}
        onClose={closeModal}
        onSave={saveEvent}
      />
    {:else if modal === "tooth"}
      <ToothDrawer
        tooth={selectedTooth}
        {events}
        onClose={closeModal}
        onAdd={openAdd}
        onOpenEvent={openEvent}
        onResolveComplaint={resolveComplaint}
      />
    {:else if modal === "event" && selectedEvent}
      <EventModal event={selectedEvent} onClose={closeModal} />
    {:else if modal === "share"}
      <ShareModal
        eventsCount={events.length}
        onClose={closeModal}
        onCreate={createShare}
      />
    {:else if modal === "data"}
      <DataModal
        {events}
        {clinics}
        {doctors}
        {currencies}
        {firebaseEnabled}
        onClose={closeModal}
        onImport={importData}
      />
    {/if}

    {#if toast}<div class="global-toast"><Check size={17} />{toast}</div>{/if}
  </div>
{/if}
