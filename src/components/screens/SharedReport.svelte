<script>
  import { Clock3, Info, Printer, ShieldCheck } from "@lucide/svelte";
  import { formatDate } from "../../lib/dental-utils.js";
  import Logo from "../common/Logo.svelte";

  export let data;
</script>

<main class="shared-report">
  <header class="shared-header">
    <Logo subtitle="выписка для врача" />
    <span class="read-only"><ShieldCheck size={16} />Только просмотр</span>
  </header>
  {#if data.expired}
    <section class="shared-expired">
      <span><Clock3 size={30} /></span>
      <h1>Ссылка недоступна</h1>
      <p>Срок временного доступа истёк или ссылка была отозвана пациентом.</p>
    </section>
  {:else}
    <section class="shared-content">
      <div class="shared-title">
        <span class="eyebrow">СТОМАТОЛОГИЧЕСКАЯ ВЫПИСКА</span>
        <h1>История лечения пациента</h1>
        <p>
          Сформировано {formatDate(
            new Date(data.createdAt).toISOString().slice(0, 10),
            true,
          )} · {data.events.length} событий
        </p>
      </div>
      <div class="shared-alert">
        <Info size={18} /><span
          >Данные предоставлены пациентом. Эта выписка не заменяет осмотр и
          медицинскую документацию клиники.</span
        ><button class="secondary" on:click={() => window.print()}
          ><Printer size={16} />Печать</button
        >
      </div>
      <div class="card shared-table">
        <table>
          <thead
            ><tr
              ><th>Дата</th><th>Зуб</th><th>Лечение</th><th>Врач и клиника</th
              ><th>Комментарий</th></tr
            ></thead
          ><tbody
            >{#each [...data.events].sort( (a, b) => b.date.localeCompare(a.date) ) as event}<tr
                ><td>{formatDate(event.date)}</td><td
                  ><span class="tooth-number">{event.tooth}</span></td
                ><td
                  ><b>{event.title}</b>{#if event.surfaces?.length}<small
                      >{event.surfaces.join(", ")}</small
                    >{/if}</td
                ><td><b>{event.doctor}</b><small>{event.clinic}</small></td><td
                  >{event.notes}</td
                ></tr
              >{/each}</tbody
          >
        </table>
      </div>
    </section>
  {/if}
</main>
