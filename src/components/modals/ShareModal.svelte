<script>
  import { Check, Copy, Share2, ShieldCheck, X } from "@lucide/svelte";
  import { SHARE_DURATIONS } from "../../lib/dental-data.js";
  import ModalShell from "../common/ModalShell.svelte";

  export let eventsCount = 0;
  export let onClose = () => {};
  export let onCreate = async () => "";

  let duration = "7";
  let shareLink = "";
  let copied = false;
  let creating = false;

  async function create() {
    creating = true;
    shareLink = await onCreate(duration);
    creating = false;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {}
    copied = true;
    setTimeout(() => (copied = false), 1600);
  }
</script>

<ModalShell className="share-modal" {onClose}>
  {#if shareLink}
    <div class="success-state">
      <span><Check size={30} /></span>
      <h2>Ссылка готова</h2>
      <p>
        Врач сможет просматривать выбранные данные в течение {duration} дней без регистрации.
      </p>
      <div class="copy-field">
        <span>{shareLink.replace(/^https?:\/\//, "")}</span><button
          on:click={copy}
          >{#if copied}<Check size={17} />{:else}<Copy size={17} />{/if}{copied
            ? "Скопировано"
            : "Копировать"}</button
        >
      </div>
      <div class="secure-note">
        <ShieldCheck size={19} /><span
          >Доступ только для чтения. Вы можете отозвать ссылку в любое время.</span
        >
      </div>
      <button class="primary wide" on:click={onClose}>Готово</button>
    </div>
  {:else}
    <div class="modal-head">
      <div>
        <span class="eyebrow">БЕЗ РЕГИСТРАЦИИ</span>
        <h2>Доступ для врача</h2>
        <p>Создайте защищённую ссылку только для просмотра.</p>
      </div>
      <button class="close-btn" on:click={onClose}><X size={21} /></button>
    </div>
    <div class="share-selection">
      <div class="check-row">
        <span class="fake-check checked"><Check size={13} /></span><span
          ><b>Карта зубов и текущий статус</b><small
            >Состояние всех 32 зубов</small
          ></span
        >
      </div>
      <div class="check-row">
        <span class="fake-check checked"><Check size={13} /></span><span
          ><b>Полная история лечения</b><small
            >{eventsCount} событий, врачи и клиники</small
          ></span
        >
      </div>
      <div class="check-row">
        <span class="fake-check"></span><span
          ><b>Стоимость лечения</b><small>Скрыто по умолчанию</small></span
        >
      </div>
    </div>
    <div class="field-label">Срок действия ссылки</div>
    <div class="duration-picker">
      {#each SHARE_DURATIONS as option}<button
          class:active={duration === option[0]}
          on:click={() => (duration = option[0])}
          >{option[1]}{#if option[0] === "7"}<small>обычно достаточно</small
            >{/if}</button
        >{/each}
    </div>
    <div class="modal-footer">
      <button class="secondary" on:click={onClose}>Отмена</button><button
        class="primary"
        disabled={creating}
        on:click={create}
        ><Share2 size={17} />{creating ? "Создаём…" : "Создать ссылку"}</button
      >
    </div>
  {/if}
</ModalShell>
