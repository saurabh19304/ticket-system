/**
 * TicketPortal Frontend Logic
 * Implements communication with Go Gin REST API.
 */

// --- Global Application State ---
const state = {
  apiUrl: localStorage.getItem('ticket_system_api_url') || 'https://ticket-system-0e68.onrender.com',
  token: localStorage.getItem('ticket_system_token') || null,
  userEmail: localStorage.getItem('ticket_system_user_email') || '',
  tickets: [],
  currentFilter: 'all',
  currentAuthTab: 'login', // 'login' or 'register'
};

// --- DOM Elements ---
const elements = {
  // Navigation & settings
  apiStatusDot: document.getElementById('api-status-dot'),
  apiStatusPulse: document.getElementById('api-status-pulse'),
  apiStatusText: document.getElementById('api-status-text'),
  btnSettingsToggle: document.getElementById('btn-settings-toggle'),
  btnSettingsClose: document.getElementById('btn-settings-close'),
  settingsPanel: document.getElementById('settings-panel'),
  inputApiUrl: document.getElementById('input-api-url'),
  btnSaveApiUrl: document.getElementById('btn-save-api-url'),
  headerUserSection: document.getElementById('header-user-section'),
  userEmailDisplay: document.getElementById('user-email-display'),
  btnLogout: document.getElementById('btn-logout'),

  // Views
  viewAuth: document.getElementById('view-auth'),
  viewDashboard: document.getElementById('view-dashboard'),

  // Auth View elements
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),
  authAlert: document.getElementById('auth-alert'),
  authAlertIcon: document.getElementById('auth-alert-icon'),
  authAlertMsg: document.getElementById('auth-alert-msg'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  btnTogglePassword: document.getElementById('btn-toggle-password'),
  eyeIcon: document.getElementById('eye-icon'),
  btnAuthSubmit: document.getElementById('btn-auth-submit'),
  authSubmitText: document.getElementById('auth-submit-text'),

  // Dashboard Stats
  statTotal: document.getElementById('stat-total'),
  statOpen: document.getElementById('stat-open'),
  statActive: document.getElementById('stat-active'),
  statClosed: document.getElementById('stat-closed'),

  // Create Ticket Form
  formCreateTicket: document.getElementById('form-create-ticket'),
  ticketTitle: document.getElementById('ticket-title'),
  ticketDesc: document.getElementById('ticket-desc'),

  // Tickets List & States
  ticketsList: document.getElementById('tickets-list'),
  ticketsLoading: document.getElementById('tickets-loading'),
  ticketsEmpty: document.getElementById('tickets-empty'),
  ticketCount: document.getElementById('ticket-count'),
  filterTabs: document.querySelectorAll('.filter-tab'),

  // Toast
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastIconContainer: document.getElementById('toast-icon-container'),
  toastMsg: document.getElementById('toast-msg'),
};

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  elements.toastMsg.textContent = message;
  
  // Apply visual style based on type
  if (type === 'success') {
    elements.toastIconContainer.className = 'p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800';
    elements.toastIcon.setAttribute('data-lucide', 'check-circle-2');
  } else if (type === 'error') {
    elements.toastIconContainer.className = 'p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-800';
    elements.toastIcon.setAttribute('data-lucide', 'alert-circle');
  } else {
    elements.toastIconContainer.className = 'p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800';
    elements.toastIcon.setAttribute('data-lucide', 'info');
  }
  
  // Re-run lucide to render the newly set icon
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Animate toast in
  elements.toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  elements.toast.classList.add('translate-y-0', 'opacity-100');

  // Hide toast after 3.5 seconds
  setTimeout(() => {
    elements.toast.classList.remove('translate-y-0', 'opacity-100');
    elements.toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

// --- API Helpers ---
async function request(endpoint, options = {}) {
  const url = `${state.apiUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Attempt parsing as JSON.
    let data = {};
    const textContent = await response.text();
    if (textContent) {
      try {
        data = JSON.parse(textContent);
      } catch (e) {
        data = { message: textContent };
      }
    }

    if (!response.ok) {
      throw { 
        status: response.status, 
        message: data.error || data.message || 'Something went wrong.' 
      };
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// --- Health Check ---
async function checkApiHealth() {
  // Update UI to connecting
  elements.apiStatusDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-500';
  elements.apiStatusPulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75';
  elements.apiStatusText.textContent = 'Connecting...';
  elements.apiStatusText.className = 'text-amber-500 font-medium';

  try {
    const data = await request('/health', { method: 'GET' });
    
    // Success: Online
    elements.apiStatusDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-emerald-500';
    elements.apiStatusPulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75';
    elements.apiStatusText.textContent = 'API Online';
    elements.apiStatusText.className = 'text-emerald-500 font-medium';
    return true;
  } catch (error) {
    // Failure: Offline
    elements.apiStatusDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-red-500';
    elements.apiStatusPulse.className = 'absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-0';
    elements.apiStatusText.textContent = 'API Offline';
    elements.apiStatusText.className = 'text-red-500 font-medium';
    return false;
  }
}

// --- View Updates ---
function updateView() {
  if (state.token) {
    // Authenticated State
    elements.viewAuth.classList.add('hidden');
    elements.viewDashboard.classList.remove('hidden');
    
    elements.headerUserSection.classList.remove('hidden');
    elements.userEmailDisplay.textContent = state.userEmail;
    elements.userEmailDisplay.title = state.userEmail;
    
    // Fetch tickets
    fetchTickets();
  } else {
    // Guest State
    elements.viewAuth.classList.remove('hidden');
    elements.viewDashboard.classList.add('hidden');
    elements.headerUserSection.classList.add('hidden');
    
    // Clear forms
    elements.authEmail.value = '';
    elements.authPassword.value = '';
    hideAuthAlert();
  }
}

// --- Auth Utilities ---
function showAuthAlert(message, type = 'error') {
  elements.authAlert.className = `text-xs px-4 py-3 rounded-lg border flex items-center space-x-2 ${
    type === 'success' 
      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' 
      : 'bg-red-950/40 text-red-400 border-red-900'
  }`;
  elements.authAlertMsg.textContent = message;
  elements.authAlertIcon.setAttribute('data-lucide', type === 'success' ? 'check-circle-2' : 'alert-circle');
  elements.authAlert.classList.remove('hidden');
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function hideAuthAlert() {
  elements.authAlert.classList.add('hidden');
}

function switchAuthTab(tab) {
  state.currentAuthTab = tab;
  hideAuthAlert();

  if (tab === 'login') {
    elements.tabLogin.className = 'flex-1 py-2 text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 text-white transition-all';
    elements.tabRegister.className = 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition-all';
    elements.authSubmitText.textContent = 'Sign In';
  } else {
    elements.tabRegister.className = 'flex-1 py-2 text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 text-white transition-all';
    elements.tabLogin.className = 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition-all';
    elements.authSubmitText.textContent = 'Create Account';
  }
}

// --- Ticket Management CRUD ---
async function fetchTickets() {
  elements.ticketsLoading.classList.remove('hidden');
  elements.ticketsEmpty.classList.add('hidden');
  elements.ticketsList.innerHTML = '';
  
  try {
    const tickets = await request('/tickets', { method: 'GET' });
    // In GORM, response keys might be lowercase or capitalized depending on serialization.
    // We normalize them in a local structure.
    state.tickets = (tickets || []).map(t => ({
      id: t.ID || t.id,
      title: t.Title || t.title || 'No Title',
      description: t.Description || t.description || '',
      status: (t.Status || t.status || 'open').toLowerCase(),
      createdAt: t.CreatedAt || t.createdAt || new Date().toISOString(),
    }));
    
    renderTickets();
  } catch (error) {
    showToast(error.message || 'Failed to fetch tickets.', 'error');
  } finally {
    elements.ticketsLoading.classList.add('hidden');
  }
}

function renderTickets() {
  // Filters tickets based on state.currentFilter
  let filteredTickets = state.tickets;
  if (state.currentFilter !== 'all') {
    filteredTickets = state.tickets.filter(t => t.status === state.currentFilter);
  }

  // Update statistics
  const countTotal = state.tickets.length;
  const countOpen = state.tickets.filter(t => t.status === 'open').length;
  const countActive = state.tickets.filter(t => t.status === 'in_progress').length;
  const countClosed = state.tickets.filter(t => t.status === 'closed').length;

  elements.statTotal.textContent = countTotal;
  elements.statOpen.textContent = countOpen;
  elements.statActive.textContent = countActive;
  elements.statClosed.textContent = countClosed;
  elements.ticketCount.textContent = filteredTickets.length;

  // Manage empty states
  if (filteredTickets.length === 0) {
    elements.ticketsEmpty.classList.remove('hidden');
    elements.ticketsList.classList.add('hidden');
    
    // Change empty state description depending on selected filter
    const emptyDesc = document.getElementById('empty-state-desc');
    if (state.currentFilter === 'all') {
      emptyDesc.textContent = 'Create your first ticket using the form on the left to get support.';
    } else {
      emptyDesc.textContent = `No tickets match the "${state.currentFilter}" filter.`;
    }
    return;
  }

  elements.ticketsEmpty.classList.add('hidden');
  elements.ticketsList.classList.remove('hidden');

  // Render cards
  elements.ticketsList.innerHTML = filteredTickets.map(ticket => {
    // Style badges and status actions
    let badgeColor = '';
    let statusActionHtml = '';

    if (ticket.status === 'open') {
      badgeColor = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      statusActionHtml = `
        <button onclick="updateTicketStatus(${ticket.id}, 'in_progress')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/10 active:scale-[0.97] transition-all">
          <i data-lucide="play" class="w-3 h-3"></i>
          <span>Start Work</span>
        </button>
      `;
    } else if (ticket.status === 'in_progress') {
      badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      statusActionHtml = `
        <button onclick="updateTicketStatus(${ticket.id}, 'closed')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/10 active:scale-[0.97] transition-all">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>Resolve & Close</span>
        </button>
      `;
    } else {
      // closed
      badgeColor = 'bg-slate-800 text-slate-400 border border-slate-700/50';
      statusActionHtml = `
        <span class="text-xs text-slate-500 font-medium italic flex items-center">
          <i data-lucide="lock" class="w-3 h-3 mr-1"></i> Closed & Read-only
        </span>
      `;
    }

    const formattedDate = new Date(ticket.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="glass-card p-5 rounded-xl hover:border-slate-700 transition-all duration-200 flex flex-col space-y-4 hover:shadow-lg relative overflow-hidden group">
        
        <!-- Subtle gradient shine on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300"></div>

        <!-- Header -->
        <div class="flex items-start justify-between relative z-10">
          <span class="text-xs font-semibold text-slate-500 font-mono">#${ticket.id}</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${badgeColor}">${ticket.status.replace('_', ' ')}</span>
        </div>

        <!-- Body -->
        <div class="space-y-1.5 flex-1 relative z-10">
          <h3 class="text-base font-bold text-white tracking-tight">${escapeHtml(ticket.title)}</h3>
          <p class="text-sm text-slate-400 line-clamp-3 leading-relaxed">${escapeHtml(ticket.description || 'No description provided.')}</p>
        </div>

        <!-- Meta info -->
        <div class="text-[10px] text-slate-500 font-medium border-t border-slate-900 pt-3 flex justify-between items-center relative z-10">
          <span class="flex items-center"><i data-lucide="calendar" class="w-3 h-3 mr-1"></i> ${formattedDate}</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between mt-1 relative z-10">
          <div class="flex-1">
            ${statusActionHtml}
          </div>
          <button onclick="deleteTicket(${ticket.id})" class="p-2 text-slate-500 hover:text-red-400 bg-slate-950 hover:bg-red-950/20 border border-slate-900 hover:border-red-900/40 rounded-lg transition-all" title="Delete Ticket">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- Update Ticket Status Action ---
async function updateTicketStatus(id, newStatus) {
  try {
    const updated = await request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    
    showToast(`Ticket status updated to ${newStatus.replace('_', ' ')}!`, 'success');
    
    // Update local state and re-render
    const ticketIdx = state.tickets.findIndex(t => t.id === id);
    if (ticketIdx !== -1) {
      state.tickets[ticketIdx].status = newStatus;
      renderTickets();
    }
  } catch (error) {
    showToast(error.message || 'Failed to update ticket status.', 'error');
  }
}

// --- Delete Ticket Action ---
async function deleteTicket(id) {
  if (!confirm('Are you sure you want to delete this ticket?')) return;

  try {
    await request(`/tickets/${id}`, { method: 'DELETE' });
    showToast('Ticket deleted successfully.', 'success');
    
    // Update state and render
    state.tickets = state.tickets.filter(t => t.id !== id);
    renderTickets();
  } catch (error) {
    showToast(error.message || 'Failed to delete ticket.', 'error');
  }
}

// --- Helper: HTML Escaping ---
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Event Handlers & Submissions ---

// Auth Tab switching
elements.tabLogin.addEventListener('click', () => switchAuthTab('login'));
elements.tabRegister.addEventListener('click', () => switchAuthTab('register'));

// Password toggle
elements.btnTogglePassword.addEventListener('click', () => {
  const currentType = elements.authPassword.type;
  if (currentType === 'password') {
    elements.authPassword.type = 'text';
    elements.eyeIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    elements.authPassword.type = 'password';
    elements.eyeIcon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Auth form Submit
elements.btnAuthSubmit.addEventListener('click', async () => {
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || !password) {
    showAuthAlert('Please fill in all fields.');
    return;
  }

  // Simple front validation
  if (!email.includes('@')) {
    showAuthAlert('Please enter a valid email address.');
    return;
  }

  elements.btnAuthSubmit.disabled = true;
  const originalText = elements.authSubmitText.textContent;
  elements.authSubmitText.textContent = 'Processing...';

  try {
    if (state.currentAuthTab === 'login') {
      // Perform login
      const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      state.token = response.token;
      state.userEmail = email;
      localStorage.setItem('ticket_system_token', state.token);
      localStorage.setItem('ticket_system_user_email', email);

      showToast('Logged in successfully.', 'success');
      updateView();
    } else {
      // Perform registration
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      showAuthAlert('Account created! You can now log in.', 'success');
      showToast('Registration successful! Please login.', 'success');
      switchAuthTab('login');
    }
  } catch (error) {
    showAuthAlert(error.message || 'Authentication failed. Please verify credentials.');
  } finally {
    elements.btnAuthSubmit.disabled = false;
    elements.authSubmitText.textContent = originalText;
  }
});

// Create Ticket submit
elements.formCreateTicket.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = elements.ticketTitle.value.trim();
  const description = elements.ticketDesc.value.trim();

  if (!title) {
    showToast('Title is required.', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-create-ticket');
  submitBtn.disabled = true;
  const originalHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>Creating...</span>';

  try {
    const createdTicket = await request('/tickets', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });

    showToast('Support ticket created successfully!', 'success');
    
    // Clear form
    elements.formCreateTicket.reset();

    // Refresh tickets list
    fetchTickets();
  } catch (error) {
    showToast(error.message || 'Failed to create ticket.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHtml;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
});

// Logout action
elements.btnLogout.addEventListener('click', () => {
  state.token = null;
  state.userEmail = '';
  localStorage.removeItem('ticket_system_token');
  localStorage.removeItem('ticket_system_user_email');
  
  showToast('Logged out successfully.', 'info');
  updateView();
});

// Settings Toggle Panel
elements.btnSettingsToggle.addEventListener('click', () => {
  elements.settingsPanel.classList.toggle('hidden');
});

elements.btnSettingsClose.addEventListener('click', () => {
  elements.settingsPanel.classList.add('hidden');
});

elements.btnSaveApiUrl.addEventListener('click', () => {
  let url = elements.inputApiUrl.value.trim();
  if (!url) return;

  // Clean trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  state.apiUrl = url;
  localStorage.setItem('ticket_system_api_url', url);
  showToast(`API Base URL saved: ${url}`, 'success');
  elements.settingsPanel.classList.add('hidden');
  
  // Re-check health and reload view
  checkApiHealth();
  if (state.token) {
    fetchTickets();
  }
});

// Filter Tabs Click Handlers
elements.filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active visual class
    elements.filterTabs.forEach(t => {
      t.className = 'filter-tab px-3 py-1.5 font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-all';
    });
    tab.className = 'filter-tab px-3 py-1.5 font-medium rounded-lg bg-slate-800 border border-slate-700 text-white transition-all';

    state.currentFilter = tab.getAttribute('data-filter');
    renderTickets();
  });
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Setup inputs
  elements.inputApiUrl.value = state.apiUrl;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Health check API
  checkApiHealth();

  // Load appropriate initial screen
  updateView();
});

// Expose status update and delete functions to global window for onclick attributes
window.updateTicketStatus = updateTicketStatus;
window.deleteTicket = deleteTicket;
