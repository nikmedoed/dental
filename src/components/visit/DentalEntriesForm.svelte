<script>
  import { Check, CircleHelp, Trash2 } from "@lucide/svelte";
  import {
    LOWER_TEETH,
    SURFACES,
    TREATMENT_KINDS,
    UPPER_TEETH,
  } from "../../lib/dental-data.js";
  import { describeTooth } from "../../lib/dental-utils.js";
  import AttachmentPicker from "./AttachmentPicker.svelte";

  export let initialTooth = null;
  export let visitType = "inspection";
  export let items = [];

  const DISPLAY_TEETH = [
    ...[...UPPER_TEETH].reverse(),
    ...[...LOWER_TEETH].reverse(),
  ];
  const SURFACE_KINDS = new Set(["filling", "diagnosis", "other"]);
  const SURFACE_LABELS = {
    Жевательная: ["Жевательная", "сверху"],
    Мезиальная: ["Мезиальная", "к центру ряда"],
    Дистальная: ["Дистальная", "от центра ряда"],
    Вестибулярная: ["Вестибулярная", "к губе или щеке"],
    Язычная: ["Язычная", "к языку или нёбу"],
  };

  let previousVisitType = visitType;

  if (initialTooth && !items.some((item) => item.tooth === Number(initialTooth))) {
    items = [createEntry(Number(initialTooth))];
  }

  $: if (visitType !== previousVisitType) {
    const switchingToComplaint = visitType === "complaint";
    items = items.map((item) => {
      if (switchingToComplaint && item.kind === "diagnosis") {
        return entryWithKind(item, "complaint");
      }
      if (!switchingToComplaint && item.kind === "complaint") {
        return entryWithKind(item, "diagnosis");
      }
      return item;
    });
    previousVisitType = visitType;
  }

  function createEntry(tooth) {
    const defaultKind = visitType === "complaint" ? "complaint" : "diagnosis";
    const kind =
      TREATMENT_KINDS.find((option) => option.value === defaultKind) ||
      TREATMENT_KINDS[0];
    return {
      id: crypto.randomUUID(),
      tooth,
      kind: kind.value,
      status: kind.status,
      title: kind.label,
      notes: "",
      surfaces: [],
      attachments: [],
    };
  }

  function entryWithKind(item, kindValue) {
    const kind = TREATMENT_KINDS.find((option) => option.value === kindValue);
    return {
      ...item,
      kind: kind.value,
      status: kind.status,
      title: kind.label,
      surfaces: SURFACE_KINDS.has(kind.value) ? item.surfaces : [],
    };
  }

  function toggleTooth(tooth) {
    items = items.some((item) => item.tooth === tooth)
      ? items.filter((item) => item.tooth !== tooth)
      : [...items, createEntry(tooth)];
  }

  function updateKind(item) {
    const kind = TREATMENT_KINDS.find((option) => option.value === item.kind);
    item.status = kind.status;
    item.title = kind.label;
    if (!SURFACE_KINDS.has(item.kind)) item.surfaces = [];
    items = [...items];
  }

  function toggleSurface(item, surface) {
    item.surfaces = item.surfaces.includes(surface)
      ? item.surfaces.filter((value) => value !== surface)
      : [...item.surfaces, surface];
    items = [...items];
  }
</script>

<section class="visit-section dental-entry-section">
  <div class="visit-section-title">
    <span>2</span>
    <div>
      <h3>Данные по зубам</h3>
      <p>Выберите зубы — для каждого сразу появится отдельная карточка</p>
    </div>
  </div>

  <div class="tooth-picker-head">
    <div>
      <b>Зубы этого визита</b>
      <span>{items.length ? `Выбрано: ${items.length}` : "Нажмите на нужные номера"}</span>
    </div>
    <details>
      <summary><CircleHelp size={17} />Как читать номера?</summary>
      <p>
        Первая цифра — четверть челюсти, вторая — позиция от центра. Стороны
        показаны с точки зрения пациента.
      </p>
    </details>
  </div>

  <div class="visit-tooth-picker">
    {#each DISPLAY_TEETH as tooth}<button
        class:active={items.some((item) => item.tooth === tooth)}
        on:click={() => toggleTooth(tooth)}
        title={describeTooth(tooth)}>{tooth}</button
      >{/each}
  </div>

  {#if !items.length}
    <div class="tooth-entry-empty">
      Выберите один или несколько зубов выше. Здесь появятся компактные поля
      для каждого из них.
    </div>
  {:else}
    <div class="tooth-entry-list">
      {#each items as item (item.id)}
        <article class="tooth-entry-card">
          <header>
            <span class="entry-tooth">{item.tooth}</span>
            <div class="tooth-entry-name">
              <b>Зуб {item.tooth}</b>
              <small>{describeTooth(item.tooth)}</small>
            </div>
            <label class="tooth-kind-field">
              <span>{item.kind === "complaint" ? "Тип записи" : "Диагноз или процедура"}</span>
              <select bind:value={item.kind} on:change={() => updateKind(item)}>
                {#each TREATMENT_KINDS as kind}
                  <option value={kind.value}>{kind.label}</option>
                {/each}
              </select>
            </label>
            <button
              class="remove-tooth-entry"
              on:click={() => toggleTooth(item.tooth)}
              title="Убрать зуб из визита"><Trash2 size={17} /></button
            >
          </header>

          <div class="tooth-entry-fields" class:without-surfaces={!SURFACE_KINDS.has(item.kind)}>
            {#if SURFACE_KINDS.has(item.kind)}
              <div class="entry-surfaces">
                <div class="field-label">Поверхности <small>необязательно</small></div>
                <div class="surface-picker tooth-surface-picker">
                  {#each SURFACES as surface}<button
                      class:active={item.surfaces.includes(surface)}
                      on:click={() => toggleSurface(item, surface)}
                      title={surface}
                      >{#if item.surfaces.includes(surface)}<Check size={13} />{/if}
                      <span><b>{SURFACE_LABELS[surface][0]}</b><small>{SURFACE_LABELS[surface][1]}</small></span></button
                    >{/each}
                </div>
              </div>
            {/if}
            <label class="tooth-note-field">
              <span>{item.kind === "complaint" ? "Что беспокоит" : "Заметка по зубу"} <small>необязательно</small></span>
              <textarea
                bind:value={item.notes}
                placeholder={item.kind === "complaint"
                  ? "Что болит или беспокоит, когда началось, реакция на холодное или горячее…"
                  : "Диагноз, материал, результат, рекомендации…"}
              ></textarea>
            </label>
          </div>

          <AttachmentPicker
            bind:attachments={item.attachments}
            scope="entry"
            label={`Файлы по зубу ${item.tooth} (например, снимок)`}
          />
        </article>
      {/each}
    </div>
  {/if}
</section>
