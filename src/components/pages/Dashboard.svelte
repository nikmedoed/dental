<script>
  import {
    Activity,
    CalendarDays,
    ChevronRight,
    Clock3,
    History,
    MoreHorizontal,
    Plus,
    Sparkles,
    UsersRound,
  } from "@lucide/svelte";
  import {
    LOWER_TEETH,
    NEXT_APPOINTMENT,
    ODONTOGRAM_LEGEND,
    TOOTH_STATUS,
    UPPER_TEETH,
  } from "../../lib/dental-data.js";
  import { latestStatusByTooth, sortEvents } from "../../lib/dental-utils.js";
  import EventRow from "../common/EventRow.svelte";
  import Tooth from "../common/Tooth.svelte";

  export let events = [];
  export let onAdd = () => {};
  export let onShare = () => {};
  export let onOpenTooth = () => {};
  export let onOpenEvent = () => {};
  export let onNavigate = () => {};

  let dentition = "adult";
  $: latestByTooth = latestStatusByTooth(events);
  $: recentEvents = sortEvents(events).slice(0, 4);
  $: treatedTeethCount = new Set(
    events
      .filter((event) => ["treated", "crown", "implant"].includes(event.status))
      .map((event) => event.tooth),
  ).size;
  $: attentionCount = new Set(
    events
      .filter((event) => ["watch", "issue"].includes(event.status))
      .map((event) => event.tooth),
  ).size;
  const todayLabel = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date())
    .toUpperCase();

  const stats = [
    {
      icon: History,
      value: () => events.length,
      label: "записей о лечении",
      tint: "teal",
      hint: "за всё время",
    },
    {
      icon: Activity,
      value: () => treatedTeethCount,
      label: "вылеченных зубов",
      tint: "blue",
      hint: "активная история",
    },
    {
      icon: Clock3,
      value: () => attentionCount,
      label: "требует внимания",
      tint: "amber",
      hint: "контроль состояния",
    },
    {
      icon: CalendarDays,
      value: () =>
        `${NEXT_APPOINTMENT.day} ${NEXT_APPOINTMENT.month.toLowerCase()}`,
      label: "следующий визит",
      tint: "violet",
      hint: "запланировано",
    },
  ];
</script>

<div class="page dashboard-page">
  <div class="welcome-row">
    <div>
      <span class="eyebrow">{todayLabel}</span>
      <h1>Добрый день, Алексей</h1>
      <p>
        Ваша история лечения в порядке. Один зуб стоит проверить в ближайшее
        время.
      </p>
    </div>
    <button class="primary hero-add" on:click={() => onAdd()}
      ><Plus size={20} />Новая запись</button
    >
  </div>

  <div class="stats-grid">
    {#each stats as stat}
      <div class="stat-card">
        <span class="stat-icon {stat.tint}"
          ><svelte:component this={stat.icon} size={21} /></span
        >
        <div><strong>{stat.value()}</strong><span>{stat.label}</span></div>
        <small>{stat.hint}</small>
      </div>
    {/each}
  </div>

  <div class="dashboard-grid">
    <section class="card odontogram-card">
      <div class="card-head">
        <div>
          <h2>Карта зубов</h2>
          <p>Нажмите на зуб, чтобы открыть его историю</p>
        </div>
        <div class="segmented">
          <button
            class:active={dentition === "adult"}
            on:click={() => (dentition = "adult")}>Постоянные</button
          >
          <button
            class:active={dentition === "baby"}
            on:click={() => (dentition = "baby")}>Молочные</button
          >
        </div>
      </div>

      {#if dentition === "baby"}
        <div class="empty-dentition">
          <Sparkles size={28} />
          <b>Данные о молочных зубах не добавлены</b>
          <span>Переключитесь на постоянные зубы или создайте запись.</span>
        </div>
      {:else}
        <div class="jaw-label"><span>ВЕРХНЯЯ ЧЕЛЮСТЬ</span><i></i></div>
        <div class="teeth-row">
          {#each UPPER_TEETH as tooth, index}
            {#if index === 8}<span class="midline"></span>{/if}
            <Tooth
              {tooth}
              status={latestByTooth[tooth] || "healthy"}
              onOpen={onOpenTooth}
            />
          {/each}
        </div>
        <div class="jaw-divider">
          <span>ПРАВО</span><i></i><span>ЛЕВО</span>
        </div>
        <div class="teeth-row lower">
          {#each LOWER_TEETH as tooth, index}
            {#if index === 8}<span class="midline"></span>{/if}
            <Tooth
              {tooth}
              status={latestByTooth[tooth] || "healthy"}
              onOpen={onOpenTooth}
            />
          {/each}
        </div>
        <div class="jaw-label bottom"><span>НИЖНЯЯ ЧЕЛЮСТЬ</span><i></i></div>
      {/if}

      <div class="legend">
        {#each ODONTOGRAM_LEGEND as state}
          <span
            ><i class={TOOTH_STATUS[state].className}></i>{TOOTH_STATUS[state]
              .short}</span
          >
        {/each}
        <button on:click={() => onAdd()}
          ><Plus size={15} />Добавить лечение</button
        >
      </div>
    </section>

    <aside class="dashboard-aside">
      <div class="card appointment-card">
        <div class="mini-head">
          <span>БЛИЖАЙШИЙ ВИЗИТ</span><button
            ><MoreHorizontal size={18} /></button
          >
        </div>
        <div class="appointment-date">
          <strong>{NEXT_APPOINTMENT.day}</strong><span
            >{NEXT_APPOINTMENT.month}<br />{NEXT_APPOINTMENT.weekday}</span
          >
        </div>
        <h3>{NEXT_APPOINTMENT.title}</h3>
        <p><i></i>Зуб {NEXT_APPOINTMENT.tooth} · {NEXT_APPOINTMENT.clinic}</p>
        <div class="doctor-mini">
          <span class="doctor-avatar">{NEXT_APPOINTMENT.doctorInitials}</span
          ><span
            ><b>{NEXT_APPOINTMENT.doctor}</b><small
              >{NEXT_APPOINTMENT.specialty}</small
            ></span
          >
        </div>
        <button class="secondary wide"
          ><CalendarDays size={17} />Добавить в календарь</button
        >
      </div>
      <div class="card share-card">
        <span class="share-illustration"><UsersRound size={27} /></span>
        <div>
          <h3>На приём с полной историей</h3>
          <p>Откройте врачу временный доступ к выбранным данным.</p>
        </div>
        <button on:click={onShare}
          >Поделиться с врачом <ChevronRight size={17} /></button
        >
      </div>
    </aside>
  </div>

  <section class="card recent-card">
    <div class="card-head">
      <div>
        <h2>Последние записи</h2>
        <p>Недавние изменения в истории лечения</p>
      </div>
      <button class="text-button" on:click={() => onNavigate("history")}
        >Вся история <ChevronRight size={16} /></button
      >
    </div>
    <div class="events-list">
      {#each recentEvents as event}<EventRow
          {event}
          onOpen={onOpenEvent}
        />{/each}
    </div>
  </section>
</div>
