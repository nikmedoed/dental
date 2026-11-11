<script>
  import { Check, X } from "@lucide/svelte";
  import { DEFAULT_CURRENCIES, VISIT_TYPES } from "../../lib/dental-data.js";
  import {
    eventEntries,
    isValidDate,
    localDate,
  } from "../../lib/dental-utils.js";
  import ModalShell from "../common/ModalShell.svelte";
  import DentalEntriesForm from "../visit/DentalEntriesForm.svelte";
  import VisitDetailsForm from "../visit/VisitDetailsForm.svelte";

  export let initialEvent = null;
  export let initialTooth = null;
  export let clinics = [];
  export let doctors = [];
  export let currencies = DEFAULT_CURRENCIES;
  export let onClose = () => {};
  export let onSave = () => {};

  const NEW_VALUE = "__new__";
  const EMPTY_VALUE = "";
  let visitType = initialEvent?.type || "inspection";
  let date = initialEvent?.date || localDate();
  let visitTitle = initialEvent?.title ?? "";
  let doctorId = initialEvent?.doctorId ?? "";
  let newDoctorName = "";
  let newDoctorSpecialty = "";
  let visitNotes = initialEvent?.notes ?? "";
  let clinicId = initialEvent?.clinicId ?? "";
  let newClinicName = "";
  let newClinicCity = "";
  let amount = initialEvent?.cost ?? "";
  let currencyCode =
    initialEvent?.currency?.code ||
    initialEvent?.currency ||
    currencies[0]?.code ||
    "AMD";
  let newCurrencyCode = "";
  let newCurrencySymbol = "";
  let newCurrencyName = "";
  let visitAttachments = structuredClone(initialEvent?.attachments || []);
  let items = initialEvent ? structuredClone(eventEntries(initialEvent)) : [];
  let error = "";
  let saving = false;
  let visitFilesLoading = false;
  let toothFilesLoading = false;
  const draftId = initialEvent?.id || `visit-${crypto.randomUUID()}`;

  $: currentVisitType = VISIT_TYPES.find((item) => item.value === visitType);
  $: selectedClinic = clinics.find((clinic) => clinic.id === clinicId);
  $: selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);
  $: selectedCurrency = currencies.find(
    (currency) => currency.code === currencyCode,
  );

  function buildNewClinic() {
    if (clinicId !== NEW_VALUE || !newClinicName.trim()) return null;
    return {
      id: `clinic-${crypto.randomUUID()}`,
      name: newClinicName.trim(),
      city: newClinicCity.trim(),
    };
  }

  function buildNewCurrency() {
    if (currencyCode !== NEW_VALUE || !newCurrencyCode.trim()) return null;
    return {
      code: newCurrencyCode.trim().toUpperCase(),
      symbol: newCurrencySymbol.trim(),
      name: newCurrencyName.trim() || newCurrencyCode.trim().toUpperCase(),
    };
  }

  function buildNewDoctor(clinic) {
    if (doctorId !== NEW_VALUE || !newDoctorName.trim()) return null;
    return {
      id: `doctor-${crypto.randomUUID()}`,
      name: newDoctorName.trim(),
      specialty: newDoctorSpecialty.trim(),
      clinicIds: clinic ? [clinic.id] : [],
    };
  }

  function addClinicAssociation(doctor, clinic) {
    if (!doctor || !clinic || doctor.clinicIds?.includes(clinic.id))
      return null;
    return {
      ...doctor,
      clinicIds: [...(doctor.clinicIds || []), clinic.id],
    };
  }

  async function save() {
    if (saving || visitFilesLoading || toothFilesLoading) return;
    error = "";
    if (!isValidDate(date) && !(initialEvent && date === initialEvent.date)) {
      error = "Укажите корректную дату визита.";
      return;
    }
    if (
      amount !== "" &&
      (!Number.isFinite(Number(amount)) || Number(amount) < 0)
    ) {
      error = "Стоимость должна быть неотрицательным числом.";
      return;
    }
    if (visitType === "complaint" && !items.length) {
      error = "Выберите зуб, который беспокоит.";
      return;
    }
    const newClinic = buildNewClinic();
    const newCurrency = buildNewCurrency();
    const clinic =
      newClinic ||
      selectedClinic ||
      (initialEvent &&
      clinicId === (initialEvent.clinicId || "") &&
      initialEvent.clinic
        ? initialEvent.clinicDetails || {
            id: initialEvent.clinicId || null,
            name: initialEvent.clinic,
          }
        : null);
    const currency = newCurrency || selectedCurrency;
    if (clinicId === NEW_VALUE && !clinic) {
      error = "Укажите название новой клиники или выберите «Не указана».";
      return;
    }
    const newDoctor = buildNewDoctor(clinic);
    const doctor =
      newDoctor ||
      selectedDoctor ||
      (initialEvent &&
      doctorId === (initialEvent.doctorId || "") &&
      initialEvent.doctor
        ? initialEvent.doctorDetails || {
            id: initialEvent.doctorId || null,
            name: initialEvent.doctor,
          }
        : null);
    if (doctorId === NEW_VALUE && !doctor) {
      error = "Укажите имя нового врача или выберите «Не указан».";
      return;
    }
    const updatedDoctor = newDoctor
      ? null
      : addClinicAssociation(doctor, clinic);
    if (amount && !currency) {
      error = "Выберите валюту или добавьте новую.";
      return;
    }

    const event = {
      ...initialEvent,
      id: draftId,
      type: visitType,
      kind:
        visitType === "inspection" ? "diagnosis" : items[0]?.kind || "other",
      date,
      title: visitTitle.trim() || currentVisitType.label,
      doctorId: doctor?.id || null,
      doctor: doctor?.name || "",
      doctorDetails: doctor
        ? {
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty || "",
          }
        : null,
      clinicId: clinic?.id || null,
      clinic: clinic?.name || "",
      clinicDetails: clinic || null,
      cost: amount ? Number(amount) : 0,
      currency: currency || null,
      notes: visitNotes,
      attachments: visitAttachments,
      items,
      createdAt: initialEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (new Blob([JSON.stringify(event)]).size > 900_000) {
      error = "Запись слишком большая: уменьшите вложения до 900 КБ суммарно.";
      return;
    }
    saving = true;
    try {
      await onSave({ event, newClinic, newDoctor, updatedDoctor, newCurrency });
    } catch (cause) {
      error =
        cause?.message ||
        "Не удалось сохранить запись. Данные остались в форме, повторите попытку.";
    } finally {
      saving = false;
    }
  }
</script>

<ModalShell className="add-modal" {onClose}>
  <div class="modal-head visit-modal-head">
    <div>
      <span class="eyebrow"
        >{initialEvent ? "РЕДАКТИРОВАНИЕ" : "НОВЫЙ ВИЗИТ"}</span
      >
      <h2>
        {initialEvent ? "Изменить запись" : "Добавить осмотр или лечение"}
      </h2>
      <p>Общие данные визита и отдельная запись для каждого выбранного зуба.</p>
    </div>
    <button class="close-btn" on:click={onClose}><X size={21} /></button>
  </div>

  <VisitDetailsForm
    bind:filesLoading={visitFilesLoading}
    {clinics}
    {doctors}
    {currencies}
    newValue={NEW_VALUE}
    bind:visitType
    bind:date
    bind:visitTitle
    bind:doctorId
    bind:newDoctorName
    bind:newDoctorSpecialty
    bind:visitNotes
    bind:clinicId
    bind:newClinicName
    bind:newClinicCity
    bind:amount
    bind:currencyCode
    bind:newCurrencyCode
    bind:newCurrencySymbol
    bind:newCurrencyName
    bind:visitAttachments
  />
  <DentalEntriesForm
    bind:filesLoading={toothFilesLoading}
    {initialTooth}
    {visitType}
    bind:items
  />

  {#if error}<div class="form-error">{error}</div>{/if}
  <div class="modal-footer sticky-footer">
    <div>
      <b>{items.length}</b> зубов · <b>{visitAttachments.length}</b> общих файлов
    </div>
    <button class="secondary" on:click={onClose}>Отмена</button><button
      class="primary"
      disabled={saving || visitFilesLoading || toothFilesLoading}
      on:click={save}
      ><Check size={17} />{saving ? "Сохраняем…" : "Сохранить визит"}</button
    >
  </div>
</ModalShell>
