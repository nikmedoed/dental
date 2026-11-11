<script>
  import { localDate, validateBackup } from "./lib/dental-utils.js";
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
  import { DEFAULT_CURRENCIES, DEFAULT_TOOTH } from "./lib/dental-data.js";
  import { SEED_CLINICS, SEED_DOCTORS, SEED_EVENTS, repairPersonalEvents } from "@personal-data";
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
  let mapTooth = null;
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
      validateBackup({ events: parsed });
      const corrected = firebaseEnabled ? parsed : repairPersonalEvents(parsed);
      if (corrected !== parsed) {
        const backupKey = "denta-before-prosthetics-correction";
        if (!localStorage.getItem(backupKey)) localStorage.setItem(backupKey, saved);
        localStorage.setItem("denta-events", JSON.stringify(corrected));
      }
      events = corrected;
    } catch {
      showToast(
        "Не удалось прочитать сохранённую историю. Исходные данные остаются в хранилище.",
      );
    }
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
    readPublicShare(token)
      .then((result) => {
        sharedData = result || { expired: true, events: [] };
        sharedLoading = false;
      })
      .catch(() => {
        sharedData = { expired: true, events: [] };
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

    unsubscribeCloud = subscribeToEvents(
      nextUser.uid,
      (cloudEvents) => {
        try {
          persist(cloudEvents);
        } catch (error) {
          events = cloudEvents;
          showToast(error.message);
        }
        cloudConnected = true;
      },
      () => {
        cloudConnected = false;
        showToast(
          "Не удалось синхронизировать историю. Проверьте подключение.",
        );
      },
    );
    unsubscribeDirectories = subscribeToDirectories(
      nextUser.uid,
      persistDirectories,
      () => showToast("Не удалось загрузить справочники из облака."),
    );
  }

  function persist(nextEvents) {
    try {
      localStorage.setItem("denta-events", JSON.stringify(nextEvents));
    } catch {
      throw new Error(
        "Не удалось сохранить на устройстве: хранилище недоступно или заполнено. Уменьшите вложения и повторите попытку.",
      );
    }
    events = nextEvents;
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
    selectedEvent = null;
    selectedTooth = tooth;
    modal = "add";
  }

  function openTooth(tooth) {
    mapTooth = tooth;
    modal = null;
    if (page !== "dashboard") navigate("dashboard");
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
    persist([event, ...events.filter((item) => item.id !== event.id)]);
    closeModal();
    showToast("Запись сохранена");
  }

  async function resolveComplaint(tooth) {
    const event = {
      id: `complaint-resolved-${Date.now()}`,
      type: "complaint",
      kind: "complaint_resolved",
      date: localDate(),
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
    if (firebaseEnabled && user) await saveCloudEvent(user.uid, event);
    persist([event, ...events.filter((item) => item.id !== event.id)]);
    showToast(`Жалоба по зубу ${tooth} снята`);
  }

  async function importData(data) {
    validateBackup(data);
    localStorage.setItem(
      "denta-before-import",
      JSON.stringify({ events, clinics, doctors, currencies }),
    );
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
          selectedTooth={mapTooth}
          onOpenTooth={openTooth}
          onResolveComplaint={resolveComplaint}
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
        initialEvent={selectedEvent}
        initialTooth={selectedTooth}
        {clinics}
        {doctors}
        {currencies}
        onClose={closeModal}
        onSave={saveEvent}
      />
    {:else if modal === "event" && selectedEvent}
      <EventModal
        event={selectedEvent}
        onClose={closeModal}
        onOpenTooth={openTooth}
        onEdit={() => {
          selectedTooth = null;
          modal = "add";
        }}
      />
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
