let OPENAI_API_KEY;
let CANVAS_API_KEY;
let totalPoints = 0;

// Utility to adjust points by a specific delta
function changePoints(delta) {
  totalPoints += delta;
  document.getElementById('totalPoints').textContent = totalPoints;
  chrome.storage.local.set({ totalPoints });
}

// UI Helpers
function showOpenAIKeyUI() { document.getElementById('openaiKeyContainer').style.display='block'; document.getElementById('canvasKeyContainer').style.display='none'; document.getElementById('chatContainer').style.display='none'; }
function showCanvasKeyUI() { document.getElementById('openaiKeyContainer').style.display='none'; document.getElementById('canvasKeyContainer').style.display='block'; document.getElementById('chatContainer').style.display='none'; }
function showChatUI() { document.getElementById('openaiKeyContainer').style.display='none'; document.getElementById('canvasKeyContainer').style.display='none'; document.getElementById('chatContainer').style.display='block'; }

// Load stored keys & points
chrome.storage.local.get(['openai_api_key','canvas_api_key','totalPoints'], ({ openai_api_key, canvas_api_key, totalPoints: pts }) => {
  if (!openai_api_key) { showOpenAIKeyUI(); }
  else if (!canvas_api_key) { OPENAI_API_KEY=openai_api_key; showCanvasKeyUI(); }
  else { OPENAI_API_KEY=openai_api_key; CANVAS_API_KEY=canvas_api_key; showChatUI(); }
  totalPoints = pts||0;
  document.getElementById('totalPoints').textContent = totalPoints;

  // Set up the Pokémon shop
  setStore();  // from pokeTrack.js
});

// Save OpenAI key
document.getElementById('saveOpenAIKeyBtn').onclick = () => {
  const key=document.getElementById('openaiKeyInput').value.trim();
  if(!key) return alert('Enter a valid OpenAI key');
  chrome.storage.local.set({openai_api_key:key}, ()=> showCanvasKeyUI());
};

// Save Canvas key
document.getElementById('saveCanvasKeyBtn').onclick = () => {
  const key = document.getElementById('canvasKeyInput').value.trim();
  if (!key) return alert('Enter a valid Canvas token');
  chrome.storage.local.set({ canvas_api_key: key }, () => {
    CANVAS_API_KEY = key;
    showChatUI();
    fetchCanvasTodos();  // immediately load Canvas to-dos
  });
};

// Fetch Canvas to-dos using personal token
async function fetchCanvasTodos() {
  if(!CANVAS_API_KEY) return alert('No Canvas token');
  // Debug: verify token by fetching courses
  try {
    const coursesRes = await fetch(
      'https://canvas.uw.edu/api/v1/courses',
      { headers: { 'Authorization': `Bearer ${CANVAS_API_KEY}` } }
    );
    const courses = await coursesRes.json();
    console.log('Canvas courses (debug):', courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
  }
  const res = await fetch('https://canvas.uw.edu/api/v1/users/self/todo', {
    headers:{ 'Authorization':`Bearer ${CANVAS_API_KEY}` }
  });
  const todos=await res.json(), container=document.getElementById('canvasTodos');
  console.log('Canvas API response:', todos);
  container.innerHTML='';
  todos.forEach(item=>{
    const div=document.createElement('div'); div.className='canvas-todo';
    const cb=document.createElement('input'); cb.type='checkbox'; cb.onchange=()=> adjustPoints(cb.checked);
    div.append(cb, document.createTextNode(item.title)); container.append(div);
  });
}


document.getElementById('fetchCanvasBtn').onclick = fetchCalendarEvents;

// Fetch upcoming calendar assignment events for the next 7 days
async function fetchCalendarEvents() {
  console.log('fetchCalendarEvents()', CANVAS_API_KEY);
  if (!CANVAS_API_KEY) return alert('No Canvas token');

  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + 7*24*60*60*1000).toISOString();

  try {
    // Fetch generic calendar events
    const res = await fetch(
      `https://canvas.uw.edu/api/v1/calendar_events?start_date=${start}&end_date=${end}`,
      { headers: { 'Authorization': `Bearer ${CANVAS_API_KEY}` } }
    );
    const events = await res.json();
    console.log('Calendar events raw:', events);

    // Filter for assignment events only
    let assignmentEvents = Array.isArray(events)
      ? events.filter(e => e.assignment_id).map(e => ({
          id: e.id || e.assignment_id,
          title: e.title,
          start_at: e.start_at || e.all_day_date
        }))
      : [];

    console.log('Filtered assignment events:', assignmentEvents);

    // Fallback: if no calendar assignment events, use the upcoming_events endpoint
    if (assignmentEvents.length === 0) {
      console.log('No calendar assignment events, fetching via upcoming_events endpoint...');
      try {
        const ueRes = await fetch(
          `https://canvas.uw.edu/api/v1/users/self/upcoming_events?start_date=${start}&end_date=${end}`,
          { headers: { 'Authorization': `Bearer ${CANVAS_API_KEY}` } }
        );
        const ueList = await ueRes.json();
        console.log('Upcoming events raw:', ueList);
        // Filter for assignments and map to title/start_at
        assignmentEvents = ueList
          .filter(e => e.type === 'assignment')
          .map(e => ({
            id: e.id || e.assignment_id,
            title: e.title,
            start_at: e.start_at || e.all_day_date
          }));
        console.log('Assignment events from upcoming_events:', assignmentEvents);
      } catch (err) {
        console.error('Error fetching upcoming_events fallback:', err);
      }
    }

    // Render events
    const calContainer = document.getElementById('canvasCalendar');
    calContainer.innerHTML = '';
    if (!assignmentEvents.length) {
      calContainer.textContent = 'No upcoming assignments in next 7 days.';
      return;
    }
    assignmentEvents.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'canvas-event';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = `cal-${ev.id}`;
      cb.onchange = () => adjustPoints(cb.checked);
      const due = ev.start_at
        ? new Date(ev.start_at).toLocaleDateString()
        : 'Unknown due date';
      const label = document.createElement('label');
      label.htmlFor = cb.id;
      label.textContent = `${ev.title} — Due: ${due}`;
      div.append(cb, label);
      calContainer.append(div);
    });
  } catch (err) {
    console.error('Error in fetchCalendarEvents:', err);
    alert('Failed to fetch calendar events: ' + err.message);
  }
}

// ChatGPT call
async function sendToChatGPT(text) {
  const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-3.5-turbo',messages:[{role:'system',content:'You are Hendridx, a study assistant. And you bark'},{role:'user',content:text}],max_tokens:300,temperature:0.7})});
  const data=await res.json();
  console.log('OpenAI API raw response:', data);
  if(!res.ok) throw new Error(data.error?.message||'API error'); return data.choices[0].message.content;
}

// Adjust points & save
function adjustPoints(checked) {
  totalPoints += checked?5:-5;
  document.getElementById('totalPoints').textContent=totalPoints;
  chrome.storage.local.set({totalPoints});
}

// Send & auto-generate tasks
document.getElementById('sendBtn').onclick=async()=>{
  const input=document.getElementById('userInput').value.trim(); if(!input) return;
  const out=document.getElementById('response'); out.textContent='…thinking…';
  try{ out.textContent=await sendToChatGPT(input); generateTasks(); }
  catch(e){ out.textContent='Error: '+e.message; }
};

// Generate tasks robustly, even if GPT wraps the JSON
async function generateTasks() {
  const topic = document.getElementById('userInput').value.trim();
  if (!topic) return;
  const prompt = `Based on the goal "${topic}", generate exactly three to-do tasks. Reply ONLY with a JSON array of strings.`;

  let out;
  try {
    out = await sendToChatGPT(prompt);
  } catch (e) {
    return alert('Error generating tasks: ' + e.message);
  }

  // Extract the JSON array substring
  let jsonText;
  try {
    const match = out.match(/\[.*\]/s);
    jsonText = match ? match[0] : out;
    const tasks = JSON.parse(jsonText);
    if (!Array.isArray(tasks) || tasks.length !== 3) throw new Error();

    tasks.forEach((t, i) => {
      const btn = document.getElementById(`task${i+1}Btn`);
      btn.textContent = `${t} (5 pts)`;
      btn.onclick = () => adjustPoints(true);
    });
  } catch {
    console.error('Task parse error:', out);
    alert('Failed to parse tasks from response.');
  }
}

// Shop modal & items
document.getElementById('shopBtn').onclick=()=>document.getElementById('shopModal').style.display='block';
document.getElementById('closeShop').onclick=()=>document.getElementById('shopModal').style.display='none';
document.querySelectorAll('.shop-item').forEach(img=>{img.onclick=()=>{const cost=parseInt(img.dataset.cost); if(totalPoints>=cost){adjustPoints(false);alert(`Purchased for ${cost}`);}else alert(`Need ${cost}`);};});

// Render Pokémon shop items into #pokemonShop
function renderPokemonShop() {
  const container = document.getElementById('pokemonShop');
  container.innerHTML = '';
  storePokemon.forEach(p => {
    const card = document.createElement('div');
    card.className = 'shop-pokemon-item';
    const img = document.createElement('img');
    img.src = p.image;
    img.alt = p.name;
    img.className = 'shop-item';
    const nameDiv = document.createElement('div');
    nameDiv.textContent = p.name;
    const priceDiv = document.createElement('div');
    priceDiv.textContent = `${p.price} pts`;
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.onclick = () => {
      if (totalPoints >= p.price) {
        buyPokemon(p);
        changePoints(-p.price);
        renderPokemonShop();
      } else {
        alert('Not enough points!');
      }
    };
    card.append(img, nameDiv, priceDiv, btn);
    container.append(card);
  });
}

// Wire up shop button to render Pokémon and show modal
const shopBtn = document.getElementById('shopBtn');
if (shopBtn) {
  shopBtn.onclick = () => {
    console.log('Shop button clicked, storePokemon:', storePokemon);
    if (typeof setStore === 'function') setStore();
    renderPokemonShop();
    document.getElementById('shopModal').style.display = 'block';
  };
} else {
  console.error('shopBtn element not found');
}

// Hendrix alert (if button exists)
const hendrixBtn = document.getElementById('btn');
if (hendrixBtn) {
  hendrixBtn.onclick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => alert('Hendrix says: Stay focused!')
    });
  };
}