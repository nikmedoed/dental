<script>
  import { Check, ShieldCheck } from "@lucide/svelte";
  import {
    LOGIN_PREVIEW_FILLED_TEETH,
    LOGIN_PREVIEW_TEETH,
  } from "../../lib/dental-data.js";
  import Logo from "../common/Logo.svelte";

  export let onSignIn = () => {};
  export let error = "";
</script>

<main class="login-screen">
  <section class="login-panel">
    <Logo />
    <div class="login-copy">
      <span class="eyebrow">ВАША ИСТОРИЯ. ВСЕГДА ПОД РУКОЙ.</span>
      <h1>Заботьтесь о зубах,<br />не теряя детали</h1>
      <p>
        Личная карта лечения, которая синхронизируется между вашими устройствами
        и остаётся доступной даже без сети.
      </p>
      <div class="login-benefits">
        <span><Check size={15} />Вход только через ваш Google-аккаунт</span
        ><span><Check size={15} />Данные доступны только вам</span><span
          ><Check size={15} />Полная выгрузка в любой момент</span
        >
      </div>
      <button class="google-button" on:click={onSignIn}
        ><span>G</span>Продолжить с Google</button
      >
      {#if error}<p class="auth-error">{error}</p>{/if}
      <small class="login-terms"
        >Продолжая, вы соглашаетесь с обработкой данных в вашем
        Firebase-проекте.</small
      >
    </div>
  </section>
  <section class="login-visual">
    <div class="visual-glow"></div>
    <div class="login-preview">
      <div class="preview-head">
        <span class="preview-avatar">АС</span><span
          ><b>Карта лечения</b><small>Все изменения сохранены</small></span
        >
      </div>
      <div class="preview-jaw">
        {#each LOGIN_PREVIEW_TEETH as tooth}<span
            class:filled={LOGIN_PREVIEW_FILLED_TEETH.includes(tooth)}
            >{tooth}</span
          >{/each}
      </div>
      <div class="preview-history">
        <i></i><span><b>Лечение кариеса</b><small>28 июня · зуб 16</small></span
        >
      </div>
      <div class="preview-history violet">
        <i></i><span
          ><b>Керамическая коронка</b><small>14 мая · зуб 26</small></span
        >
      </div>
    </div>
    <p><ShieldCheck size={16} />Защищено правилами доступа Firestore</p>
  </section>
</main>
