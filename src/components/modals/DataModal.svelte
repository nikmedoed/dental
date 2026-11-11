<script>
  import {
    Check,
    ChevronRight,
    Cloud,
    Download,
    ShieldCheck,
    Upload,
    X,
  } from "@lucide/svelte";
  import { validateBackup } from "../../lib/dental-utils.js";
  import ModalShell from "../common/ModalShell.svelte";

  export let events = [];
  export let clinics = [];
  export let doctors = [];
  export let currencies = [];
  export let firebaseEnabled = false;
  export let onClose = () => {};
  export let onImport = async () => {};

  let fileInput;
  let message = "";

  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 4,
            exportedAt: new Date().toISOString(),
            events,
            clinics,
            doctors,
            currencies,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `denta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    message = "Архив сохранён";
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        validateBackup(parsed);
        await onImport({
          events: parsed.events,
          clinics: parsed.clinics,
          doctors: parsed.doctors,
          currencies: parsed.currencies,
        });
        message = `Загружено записей: ${parsed.events.length}`;
      } catch (error) {
        message = error.message || "Не удалось прочитать файл";
      }
    };
    reader.readAsText(file);
  }

  async function uploadCurrentData() {
    const confirmed = window.confirm(
      "Заменить данные текущего облачного аккаунта данными с этого устройства?",
    );
    if (!confirmed) return;
    try {
      await onImport({ events, clinics, doctors, currencies });
      message = `В облако загружено записей: ${events.length}`;
    } catch {
      message = "Не удалось загрузить данные в облако";
    }
  }
</script>

<ModalShell className="data-modal" {onClose}>
  <div class="modal-head">
    <div>
      <span class="eyebrow">ВАШИ ДАННЫЕ</span>
      <h2>Синхронизация и архив</h2>
      <p>Полный контроль над вашей медицинской историей.</p>
    </div>
    <button class="close-btn" on:click={onClose}><X size={21} /></button>
  </div>
  <div class="sync-status">
    <span class="cloud-orb"><Cloud size={25} /><i></i></span><span
      ><b
        >{firebaseEnabled
          ? "Облачная синхронизация активна"
          : "Локальное хранилище активно"}</b
      ><small
        >{firebaseEnabled
          ? "Firestore синхронизирует изменения между вашими устройствами."
          : "Изменения автоматически сохраняются на этом устройстве."}</small
      ></span
    ><span class="status-badge done">Активно</span>
  </div>
  <div class="data-actions">
    <button on:click={exportData}
      ><span class="option-icon teal"><Download size={21} /></span><span
        ><b>Скачать все данные</b><small
          >Записи и настройки в формате JSON</small
        ></span
      ><ChevronRight size={18} /></button
    ><button on:click={() => fileInput.click()}
      ><span class="option-icon blue"><Upload size={21} /></span><span
        ><b>Восстановить из файла</b><small
          >Загрузить ранее созданный архив</small
        ></span
      ><ChevronRight size={18} /></button
    ><input
      bind:this={fileInput}
      type="file"
      accept="application/json"
      hidden
      on:change={importData}
    />
    {#if firebaseEnabled}<button on:click={uploadCurrentData}
        ><span class="option-icon violet"><Cloud size={21} /></span><span
          ><b>Загрузить текущие данные в облако</b><small
            >Заменить историю и справочники текущего аккаунта</small
          ></span
        ><ChevronRight size={18} /></button
      >{/if}
  </div>
  {#if message}<div class="toast-inline"><Check size={17} />{message}</div>{/if}
  {#if !firebaseEnabled}<div class="firebase-note">
      <span><ShieldCheck size={20} /></span><span
        ><b>Готово к облачной синхронизации</b><small
          >Подключите Firebase, чтобы синхронизировать данные между телефоном и
          компьютером.</small
        ></span
      ><button
        on:click={() => (message = "Добавьте ключи Firebase в файл .env")}
        >Настроить</button
      >
    </div>{/if}
  <div class="modal-footer">
    <button class="secondary" on:click={onClose}>Закрыть</button>
  </div>
</ModalShell>
