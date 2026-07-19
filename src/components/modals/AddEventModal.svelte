<script>
  import { Check, ChevronDown, Paperclip, X } from "@lucide/svelte";
  import {
    ALL_TEETH,
    DEFAULT_TOOTH,
    SURFACES,
    TREATMENT_KINDS,
  } from "../../lib/dental-data.js";
  import ModalShell from "../common/ModalShell.svelte";

  export let initialTooth = DEFAULT_TOOTH;
  export let onClose = () => {};
  export let onSave = () => {};

  let tooth = initialTooth || DEFAULT_TOOTH;
  let date = new Date().toISOString().slice(0, 10);
  let kind = "filling";
  let title = "";
  let doctor = "";
  let notes = "";
  let surfaces = [];
  $: currentKind =
    TREATMENT_KINDS.find((item) => item.value === kind) || TREATMENT_KINDS[0];

  function toggleSurface(surface) {
    surfaces = surfaces.includes(surface)
      ? surfaces.filter((item) => item !== surface)
      : [...surfaces, surface];
  }

  function save() {
    onSave({
      id: `e${Date.now()}`,
      tooth: Number(tooth),
      date,
      kind,
      status: currentKind.status,
      title: title || currentKind.label,
      notes,
      doctor: doctor || "Врач не указан",
      clinic: "Клиника не указана",
      surfaces,
      cost: 0,
    });
  }
</script>

<ModalShell className="add-modal" {onClose}>
  <div class="modal-head">
    <div>
      <span class="eyebrow">НОВАЯ ЗАПИСЬ</span>
      <h2>Что произошло?</h2>
      <p>Заполните главное — детали можно добавить позже.</p>
    </div>
    <button class="close-btn" on:click={onClose}><X size={21} /></button>
  </div>
  <div class="form-grid two">
    <label
      ><span>Зуб</span>
      <div class="select-wrap">
        <select bind:value={tooth}
          >{#each ALL_TEETH as item}<option value={item}>{item}</option
            >{/each}</select
        ><ChevronDown size={17} />
      </div></label
    >
    <label><span>Дата</span><input type="date" bind:value={date} /></label>
  </div>
  <div class="field-label">Тип записи</div>
  <div class="kind-grid">
    {#each TREATMENT_KINDS as item}<button
        class:active={kind === item.value}
        on:click={() => (kind = item.value)}
        ><i>{item.icon}</i><span>{item.label}</span
        >{#if kind === item.value}<Check size={14} />{/if}</button
      >{/each}
  </div>
  <label class="form-field"
    ><span>Название</span><input
      bind:value={title}
      placeholder={currentKind.label}
    /></label
  >
  {#if kind === "filling"}
    <div class="field-label">
      Поверхности <small>можно выбрать несколько</small>
    </div>
    <div class="surface-picker">
      {#each SURFACES as surface}<button
          class:active={surfaces.includes(surface)}
          on:click={() => toggleSurface(surface)}
          >{#if surfaces.includes(surface)}<Check
              size={13}
            />{/if}{surface}</button
        >{/each}
    </div>
  {/if}
  <div class="form-grid two">
    <label
      ><span>Врач</span><input
        bind:value={doctor}
        placeholder="Имя врача"
      /></label
    >
    <label
      ><span>Стоимость <small>необязательно</small></span><input
        inputmode="numeric"
        placeholder="0 ₽"
      /></label
    >
  </div>
  <label class="form-field"
    ><span>Заметки</span><textarea
      bind:value={notes}
      placeholder="Результат лечения, рекомендации, материалы…"
    ></textarea></label
  >
  <button class="attachment-button"
    ><Paperclip size={17} />Прикрепить снимок или документ
    <span>до 20 МБ</span></button
  >
  <div class="modal-footer">
    <button class="secondary" on:click={onClose}>Отмена</button><button
      class="primary"
      on:click={save}><Check size={17} />Сохранить запись</button
    >
  </div>
</ModalShell>
