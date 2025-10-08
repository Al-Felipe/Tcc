document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "pt-br",
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },

    // Eventos simulados (exemplo)
    events: [
      {
        title: "Passeio com Thor 🐕",
        start: "2025-10-05T09:00:00",
        end: "2025-10-05T10:00:00",
      },
      {
        title: "Passeio com Luna 🐾",
        start: "2025-10-07T15:00:00",
        end: "2025-10-07T16:00:00",
      },
      {
        title: "Passeio com Rex 🐶",
        start: "2025-10-10T08:30:00",
        end: "2025-10-10T09:30:00",
      },
      {
        title: "Passeio com Nina 🦴",
        start: "2025-10-12T17:00:00",
        end: "2025-10-12T18:00:00",
      },
    ],

    eventColor: "#003399",
    eventTextColor: "#fff",
  });

  calendar.render();
});
