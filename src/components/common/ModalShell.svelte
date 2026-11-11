<script>
  import { dialogFocus } from "../../lib/dialog-focus.js";
  import { onMount } from "svelte";

  export let className = "";
  export let onClose = () => {};

  onMount(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  });
</script>

<div
  class="modal-layer"
  role="presentation"
  on:mousedown={(event) => event.target === event.currentTarget && onClose()}
>
  <div
    class="modal {className}"
    use:dialogFocus
    role="dialog"
    aria-modal="true"
    aria-label="Запись и данные"
  >
    <slot />
  </div>
</div>
