<script>
  import {
    Archive,
    Cloud,
    FileText,
    History,
    Home,
    LogOut,
    MoreHorizontal,
    Share2,
    ShieldCheck,
  } from "@lucide/svelte";
  import Logo from "../common/Logo.svelte";

  export let page;
  export let eventsCount = 0;
  export let user;
  export let firebaseEnabled = false;
  export let onNavigate = () => {};
  export let onShare = () => {};
  export let onData = () => {};
  export let onLogout = () => {};

  const navItems = [
    ["dashboard", "Обзор", Home],
    ["history", "История", History],
    ["episodes", "По зубам", Archive],
    ["reports", "Отчёты", FileText],
  ];

  $: displayName = user?.displayName || "Пользователь";
  $: initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
</script>

<aside class="sidebar">
  <Logo onClick={() => onNavigate("dashboard")} />
  <nav class="side-nav">
    <p>ЛЕЧЕНИЕ</p>
    {#each navItems as item}
      <button
        class:active={page === item[0]}
        on:click={() => onNavigate(item[0])}
      >
        <svelte:component this={item[2]} size={19} />
        <span>{item[1]}</span>
        {#if item[0] === "history"}<em>{eventsCount}</em>{/if}
      </button>
    {/each}
    <p>ДАННЫЕ</p>
    <button on:click={onShare}
      ><Share2 size={19} /><span>Доступ врачу</span></button
    >
    <button on:click={onData}
      ><Cloud size={19} /><span>Синхронизация</span><i class="online-dot"
      ></i></button
    >
  </nav>
  <div class="privacy-card">
    <ShieldCheck size={20} />
    <span
      ><b>Данные защищены</b><small>Сохранено на этом устройстве</small></span
    >
  </div>
  <div class="user-card">
    <span class="avatar">{initials}</span>
    <span
      ><b>{displayName}</b><small
        >{firebaseEnabled ? "Google-профиль" : "Локальный профиль"}</small
      ></span
    >
    {#if firebaseEnabled}
      <button class="logout-button" title="Выйти" on:click={onLogout}
        ><LogOut size={17} /></button
      >
    {:else}
      <MoreHorizontal size={18} />
    {/if}
  </div>
</aside>
