<script>
  import {
    Check,
    ChevronRight,
    Download,
    FileDown,
    Printer,
    Share2,
  } from "@lucide/svelte";
  import { formatDate } from "../../lib/dental-utils.js";

  export let events = [];
  export let onShare = () => {};
  export let onData = () => {};

  $: reportTeeth = [...new Set(events.map((event) => event.tooth))].slice(0, 3);
  const generatedAt = formatDate(new Date().toISOString().slice(0, 10), true);
</script>

<div class="page inner-page">
  <div class="page-title">
    <div>
      <span class="eyebrow">ДЛЯ ВАС И ВРАЧА</span>
      <h1>Отчёты</h1>
      <p>Подготовьте понятную выписку из истории лечения.</p>
    </div>
  </div>
  <div class="report-grid">
    <article class="card report-feature">
      <div class="report-preview">
        <div class="paper">
          <div class="paper-logo">
            <span class="logo-mark"><i></i><i></i></span><b>Denta</b>
          </div>
          <span class="paper-line wide"></span><span class="paper-line"></span>
          <div class="paper-teeth">{reportTeeth.join("  ·  ")}</div>
          <span class="paper-line wide"></span><span class="paper-line short"
          ></span>
        </div>
      </div>
      <div class="report-copy">
        <span class="badge">РЕКОМЕНДУЕМ</span>
        <h2>Полная история лечения</h2>
        <p>
          Хронология, текущий статус зубов, врачи, клиники и заметки. Удобно
          взять на первичный приём.
        </p>
        <ul>
          <li><Check size={16} />Все {events.length} записей</li>
          <li><Check size={16} />Карта состояния зубов</li>
          <li><Check size={16} />Контакты клиник и врачей</li>
        </ul>
        <button class="primary" on:click={() => window.print()}
          ><Printer size={18} />Печать / сохранить PDF</button
        >
      </div>
    </article>
    <div class="report-options">
      <button class="card report-option" on:click={onShare}
        ><span class="option-icon teal"><Share2 size={22} /></span><span
          ><b>Временный доступ врачу</b><small
            >Защищённая ссылка с выбранным сроком действия.</small
          ></span
        ><ChevronRight size={20} /></button
      >
      <button class="card report-option" on:click={() => window.print()}
        ><span class="option-icon violet"><FileDown size={22} /></span><span
          ><b>Краткая выписка</b><small
            >Только важное: диагнозы и выполненное лечение.</small
          ></span
        ><ChevronRight size={20} /></button
      >
      <button class="card report-option" on:click={onData}
        ><span class="option-icon blue"><Download size={22} /></span><span
          ><b>Архив данных</b><small>JSON для переноса и резервной копии.</small
          ></span
        ><ChevronRight size={20} /></button
      >
    </div>
  </div>
  <section class="card report-table">
    <div class="card-head">
      <div>
        <h2>Предпросмотр отчёта</h2>
        <p>Личная медицинская история · обновлено {generatedAt}</p>
      </div>
      <span class="logo-mark"><i></i><i></i></span>
    </div>
    <table>
      <thead
        ><tr><th>Дата</th><th>Зуб</th><th>Лечение</th><th>Врач</th></tr></thead
      ><tbody
        >{#each events.slice(0, 5) as event}<tr
            ><td>{formatDate(event.date)}</td><td
              ><span class="tooth-number">{event.tooth}</span></td
            ><td><b>{event.title}</b><small>{event.clinic}</small></td><td
              >{event.doctor}</td
            ></tr
          >{/each}</tbody
      >
    </table>
  </section>
</div>
