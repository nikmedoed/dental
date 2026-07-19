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
  import { DEFAULT_TOOTH, SEED_EVENTS } from "./lib/dental-data.js";
  import {
    createPublicShare,
    firebaseEnabled,
    loginWithGoogle,
    logout as logoutFirebase,
    observeAuth,
    readPublicShare,
    replaceCloudEvents,
    saveCloudEvent,
    seedCloudIfEmpty,
    subscribeToEvents,
  } from "./lib/firebase.js";

  let events = SEED_EVENTS;
  let page = "dashboard";
  let modal = null;
  let selectedTooth = DEFAULT_TOOTH;
  let selectedEvent = null;
  let user = firebaseEnabled
    ? null
    : { uid: "local", displayName: "Алексей Смирнов" };
  let authReady = !firebaseEnabled;
  let authError = "";
  let cloudConnected = false;
  let sharedData = null;
  let sharedLoading = false;
  let toast = "";
  let unsubscribeCloud = () => {};

  onMount(() => {
    loadLocalEvents();
    loadSharedView();

    const stopAuth = firebaseEnabled ? observeAuth(connectUser) : () => {};
    const closeOnEscape = (event) => event.key === "Escape" && closeModal();
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      stopAuth();
      unsubscribeCloud();
      window.removeEventListener("keydown", closeOnEscape);
    };
  });

  function loadLocalEvents() {
    try {
      const saved = localStorage.getItem("denta-events");
      if (saved) events = JSON.parse(saved);
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
    cloudConnected = false;
    if (!nextUser) return;

    await seedCloudIfEmpty(nextUser.uid, events);
    unsubscribeCloud = subscribeToEvents(nextUser.uid, (cloudEvents) => {
      persist(cloudEvents);
      cloudConnected = true;
    });
  }

  function persist(nextEvents) {
    events = nextEvents;
    localStorage.setItem("denta-events", JSON.stringify(events));
  }

  function navigate(nextPage) {
    page = nextPage;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeModal() {
    modal = null;
  }

  function openAdd(tooth = DEFAULT_TOOTH) {
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

  async function saveEvent(event) {
    persist([event, ...events]);
    if (firebaseEnabled && user) await saveCloudEvent(user.uid, event);
    closeModal();
    showToast("Запись добавлена");
  }

  async function importEvents(nextEvents) {
    persist(nextEvents);
    if (firebaseEnabled && user) {
      await replaceCloudEvents(user.uid, nextEvents);
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
    } catch {
      authError = "Не удалось войти. Проверьте разрешённые домены в Firebase.";
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
        {firebaseEnabled}
        onClose={closeModal}
        onImport={importEvents}
      />
    {/if}

    {#if toast}<div class="global-toast"><Check size={17} />{toast}</div>{/if}
  </div>
{/if}
