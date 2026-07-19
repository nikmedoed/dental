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
  import ModalShell from "../common/ModalShell.svelte";

  export let events = [];
  export let firebaseEnabled = false;
  export let onClose = () => {};
  export let onImport = async () => {};

  let fileInput;
  let message = "";

  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), events },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "denta-backup.json";
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
        if (!Array.isArray(parsed.events)) throw new Error();
        await onImport(parsed.events);
        message = `Загружено записей: ${parsed.events.length}`;
      } catch {
        message = "Не удалось прочитать файл";
      }
    };
    reader.readAsText(file);
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
