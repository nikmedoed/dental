<script>
  import { ChevronDown, MapPin, UserRound } from "@lucide/svelte";
  import { VISIT_TYPES } from "../../lib/dental-data.js";
  import AttachmentPicker from "./AttachmentPicker.svelte";

  export let filesLoading = false;
  export let clinics = [];
  export let doctors = [];
  export let currencies = [];
  export let newValue = "__new__";
  export let visitType;
  export let date;
  export let visitTitle;
  export let doctorId;
  export let newDoctorName;
  export let newDoctorSpecialty;
  export let visitNotes;
  export let clinicId;
  export let newClinicName;
  export let newClinicCity;
  export let amount;
  export let currencyCode;
  export let newCurrencyCode;
  export let newCurrencySymbol;
  export let newCurrencyName;
  export let visitAttachments;

  $: currentVisitType = VISIT_TYPES.find((item) => item.value === visitType);
  $: selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);
  $: knownDoctorClinics = (selectedDoctor?.clinicIds || [])
    .map((id) => clinics.find((clinic) => clinic.id === id)?.name)
    .filter(Boolean);
</script>

<section class="visit-section">
  <div class="visit-section-title">
    <span>1</span>
    <div>
      <h3>О визите</h3>
      <p>Общее для всех диагнозов и процедур этого приёма</p>
    </div>
  </div>
  <div class="visit-type-grid">
    {#each VISIT_TYPES as type}<button
        class:active={visitType === type.value}
        on:click={() => (visitType = type.value)}
        ><i>{type.icon}</i>{type.label}</button
      >{/each}
  </div>
  <div class="form-grid two">
    <label><span>Дата</span><input type="date" bind:value={date} /></label>
    <label
      ><span>Врач <small>необязательно</small></span>
      <div class="select-wrap">
        <select bind:value={doctorId}
          ><option value="">Не указан</option>{#each doctors as doctor}<option
              value={doctor.id}
              >{doctor.name}{doctor.specialty
                ? ` · ${doctor.specialty}`
                : ""}</option
            >{/each}<option value={newValue}>＋ Добавить нового врача</option
          ></select
        ><ChevronDown size={17} />
      </div></label
    >
  </div>
  {#if doctorId === newValue}<div class="directory-create doctor-create">
      <UserRound size={19} /><label
        ><span>Имя нового врача</span><input
          bind:value={newDoctorName}
          placeholder="Имя и фамилия"
        /></label
      ><label
        ><span>Специализация</span><input
          bind:value={newDoctorSpecialty}
          placeholder="Например, эндодонтист"
        /></label
      >
    </div>{/if}
  {#if doctorId !== newValue && selectedDoctor}<div class="doctor-context">
      <UserRound size={16} /><span
        ><b>{selectedDoctor.specialty || "Специализация не указана"}</b><small
          >{knownDoctorClinics.length
            ? `Встречался в: ${knownDoctorClinics.join(", ")}`
            : "Место работы будет связано после сохранения визита"}</small
        ></span
      >
    </div>{/if}
  <label class="form-field"
    ><span>Название визита <small>необязательно</small></span><input
      bind:value={visitTitle}
      placeholder={currentVisitType.label}
    /></label
  >
  <div class="form-grid clinic-cost-grid">
    <label
      ><span>Клиника <small>необязательно</small></span>
      <div class="select-wrap">
        <select bind:value={clinicId}
          ><option value="">Не указана</option>{#each clinics as clinic}<option
              value={clinic.id}
              >{clinic.name}{clinic.city ? ` · ${clinic.city}` : ""}</option
            >{/each}<option value={newValue}>＋ Добавить новую клинику</option
          ></select
        ><ChevronDown size={17} />
      </div></label
    >
    <label
      ><span>Общая стоимость <small>необязательно</small></span><input
        type="number"
        min="0"
        inputmode="decimal"
        bind:value={amount}
        placeholder="0"
      /></label
    >
    <label
      ><span>Валюта</span>
      <div class="select-wrap">
        <select bind:value={currencyCode}
          >{#each currencies as currency}<option value={currency.code}
              >{currency.code} · {currency.symbol} · {currency.name}</option
            >{/each}<option value={newValue}>＋ Добавить валюту</option></select
        ><ChevronDown size={17} />
      </div></label
    >
  </div>
  {#if clinicId === newValue}<div class="directory-create">
      <MapPin size={19} /><label
        ><span>Название новой клиники</span><input
          bind:value={newClinicName}
          placeholder="Название"
        /></label
      ><label
        ><span>Город</span><input
          bind:value={newClinicCity}
          placeholder="Город"
        /></label
      >
    </div>{/if}
  {#if currencyCode === newValue}<div class="directory-create currency-create">
      <label
        ><span>Код</span><input
          maxlength="3"
          bind:value={newCurrencyCode}
          placeholder="GEL"
        /></label
      ><label
        ><span>Символ</span><input
          bind:value={newCurrencySymbol}
          placeholder="₾"
        /></label
      ><label
        ><span>Название валюты</span><input
          bind:value={newCurrencyName}
          placeholder="Грузинский лари"
        /></label
      >
    </div>{/if}
  <label class="form-field"
    ><span>Общие заметки</span><textarea
      bind:value={visitNotes}
      placeholder="Результаты осмотра, рекомендации, следующий визит…"
    ></textarea></label
  >
  <AttachmentPicker
    bind:loading={filesLoading}
    bind:attachments={visitAttachments}
    scope="visit"
    label="Прикрепить документы ко всему визиту"
  />
</section>
