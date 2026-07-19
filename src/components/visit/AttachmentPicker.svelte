<script>
  import { FilePlus2, Paperclip, X } from "@lucide/svelte";

  export let attachments = [];
  export let scope = "visit";
  export let label = "Прикрепить документы";
  export let removable = true;

  function addFiles(event) {
    const files = [...(event.target.files || [])].map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
      scope,
    }));
    attachments = [...attachments, ...files];
    event.target.value = "";
  }
</script>

<label class="attachment-button attachment-input">
  <Paperclip size={18} />{label}
  <input type="file" multiple hidden on:change={addFiles} />
</label>
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
