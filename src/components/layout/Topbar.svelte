<script>
  import { Bell, ChevronRight, Plus } from "@lucide/svelte";
  import Logo from "../common/Logo.svelte";

  export let page;
  export let firebaseEnabled = false;
  export let cloudConnected = false;
  export let onNavigate = () => {};
  export let onAdd = () => {};

  const titles = {
    dashboard: "Обзор",
    history: "История лечения",
    episodes: "Эпизоды",
    reports: "Отчёты",
  };
</script>

<header class="topbar">
  <div class="mobile-brand">
    <Logo compact subtitle="" onClick={() => onNavigate("dashboard")} />
  </div>
  <div class="breadcrumbs">
    <span>Моя стоматология</span><ChevronRight size={14} /><b>{titles[page]}</b>
  </div>
  <div class="top-actions">
    <div class="sync-pill">
      <i></i>
      <span
        >{firebaseEnabled
          ? cloudConnected
            ? "Синхронизировано"
            : "Подключаем облако…"
          : "Сохранено на устройстве"}</span
      >
    </div>
    <button class="icon-btn notification"><Bell size={20} /><i></i></button>
    <button class="primary small" on:click={onAdd}
      ><Plus size={18} />Добавить запись</button
    >
  </div>
</header>
