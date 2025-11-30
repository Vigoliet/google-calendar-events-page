import './style.css'

const eventContainer = document.querySelector('#events-container');
const eventsAmtToFetch = document.querySelector('#eventAmt');

const getRandomNumBetween = (min, max) => Math.floor(Math.random() * (max-min +1)) + min;
const getMonth = (month) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
[month];
const getDayOfWeek = (weekday) => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekday];
const isAM = (hour) => hour < 12;
const getHour = (hour) => (hour <= 12 ? hour :  hour - 12);
const getMinute = (minute) => (minute === 0 ? '00' : minute);




function processDate(date){
  let rawHour = date.getHours();
  let hour = rawHour % 12;
  if (hour === 0) hour = 12;

  const minute = date.getMinutes().toString().padStart(2, "0");
  const suffix = rawHour < 12 ? "AM" : "PM";

  const time = `${hour}:${minute} <small>${suffix}</small>`;

  return {
    month: getMonth(date.getMonth()),
    weekday: getDayOfWeek(date.getDay()),
    time,
    date: date.getDate(),
  };
}


function mapEventObject(event) {
  const start = new Date(event.start.dateTime || `${event.start.date}T00:00:00`);
  const end   = new Date(event.end.dateTime   || `${event.end.date}T00:00:00`);

  const s = processDate(start);
  const e = processDate(end);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  let dateRange;

  if (sameDay) {
    // single-day event
    if (event.start.dateTime) {
      dateRange = `${s.weekday}, ${s.time} – ${e.time}`;
    } else {
      dateRange = `${s.month} ${s.date}`;
    }
  } else {
    // multi-day event (correct full date output)
    dateRange = `${s.month} ${s.date} → ${e.month} ${e.date}`;
  }

  return {
    name: event.summary,
    description: event.description,
    location: event.location,
    start: s,
    end: e,
    dateRange,
    link: event.htmlLink,
  };
}


function createEvent(e, i) {
  const colors = ['blue', 'amber', 'rose', 'indigo', 'pink'];
  const colorScheme = colors[getRandomNumBetween(0, colors.length - 1)]

  return `<article class="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-slate-800 rounded-lg">
          <div class="p-3 shadow bg-${colorScheme}-500 text-indigo-50 uppercase grid place-items-center rounded-t-lg">
            <div class="text-sm">${e.start.month}</div>
            <div class="text-3xl font-bold">${e.start.date}</div>
          </div>
          <div class="p-4 md:p-6 lg:p-8 grid gap-4 md:gap-6">
            <div class="grid gap-1">
              <p class="text-slate-400 text-sm">${e.dateRange}</p>
              <h2 class="font-bold text-2xl">
              <a href="${e.link}">${e.name}</a>
              ${e.location 
                ? `<p class="text-slate-400 text-sm">${e.location}</p>`
                : ''}
              </h2>
              ${
              e.description
              ? `<div class="grid gap-1">
                <button class="text-slate-400 flex gap-1 items-center cursor-pointer" aria-expanded="false" aria-controls="details-${i}" id="btn-${i}">
                  <p class="pointer-events-none">See details</p>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div class="grid gap-1 hidden" id="details-${i}" aria-labelledby="btn-${i}">
                  <p class="text-slate-400">${e.description}</p>
                </div>
              </div>
            </div>`
            : '<div class="h-4"></div>'
            }
            <a href="${e.link}" class="bg-${colorScheme}-500 rounded-md px-4 py-2 text-${colorScheme}-50 shadow-2xl shadow-${colorScheme}-200 dark:shadow-none text-center font-bold hover:shadow-none ring ring-offset-0 ring-${colorScheme}-500 focus:outline-none focus:ring-offset-2">View Event</a>
          </div>
        </article>`
}

async function loadEvents(max=8){
  try {
    const endpoint = await fetch(`./.netlify/functions/calFetch?maxResults=${max}`);
    const data = await endpoint.json();
    const processedEvents = data.map(e => mapEventObject(e));
    eventContainer.innerHTML = processedEvents.map((event, i) => createEvent(event, i)).join('')
  } catch (e) {
    eventContainer.innerHTML = '<p class = "text-center text-3xl">Sorry pal something went wrong </p>'
    console.log(e);
  }
}
loadEvents();

eventContainer.addEventListener('click', (e) => {
  if(e.target.hasAttribute('aria-expanded')){
    e.target.setAttribute('aria-expanded', e.target.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
    e.target.querySelector('svg').classList.toggle('rotate-180');
    e.target.nextElementSibling.classList.toggle('hidden');
  }
})
eventsAmtToFetch.addEventListener
('change', (e) => loadEvents(eventsAmtToFetch.value))