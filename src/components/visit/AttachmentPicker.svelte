<script>
  import { FilePlus2, Paperclip, X } from "@lucide/svelte";

  export let attachments = [];
  export let scope = "visit";
  export let label = "Прикрепить документы";
  export let removable = true;

  let error = "";
  export let loading = false;
  async function addFiles(event) {
    const input = event.target;
    const selected = [...(input.files || [])];
    error = "";
    loading = true;
    try {
      if (selected.some((file) => file.size > 500_000))
        throw new Error(
          "Файл должен быть не больше 500 КБ. Для большого снимка добавьте ссылку в заметку.",
        );
      const files = await Promise.all(
        selected.map(async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          scope,
          dataUrl: await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () =>
              reject(new Error("Не удалось прочитать файл."));
            reader.readAsDataURL(file);
          }),
        })),
      );
      attachments = [...attachments, ...files];
    } catch (cause) {
      error = cause.message;
    } finally {
      loading = false;
      input.value = "";
    }
  }
</script>

<label class="attachment-button attachment-input">
  <Paperclip size={18} />{label}
  <input type="file" multiple hidden disabled={loading} on:change={addFiles} />
</label>
<small>До 500 КБ на файл; до 900 КБ на запись с вложениями.</small>
{#if attachments.length}
  <div class="attachment-list">
    {#each attachments as attachment}
      <span>
        <FilePlus2 size={15} />{attachment.name}
        {#if removable}<button
            on:click={() =>
              (attachments = attachments.filter(
                (item) => item.id !== attachment.id,
              ))}><X size={13} /></button
          >{/if}
      </span>
    {/each}
  </div>
{/if}

{#if loading}<p role="status">Читаем файлы…</p>{/if}
{#if error}<p class="form-error" role="alert">{error}</p>{/if}
