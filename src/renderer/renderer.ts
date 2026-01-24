declare global {
  interface Window {
    clueless: {
      toggleProtection: () => Promise<boolean>;
      getProtectionState: () => Promise<boolean>;
    };
  }
}

const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');

if (!(statusEl instanceof HTMLElement) || !(toggleBtn instanceof HTMLButtonElement)) {
  throw new Error('Missing UI elements.');
}

const setUi = (enabled: boolean) => {
  document.body.dataset.enabled = enabled ? 'on' : 'off';
  statusEl.textContent = enabled ? 'ON' : 'OFF';
  toggleBtn.textContent = enabled ? 'Disable Protection' : 'Enable Protection';
};

const init = async () => {
  const enabled = await window.clueless.getProtectionState();
  setUi(enabled);
};

toggleBtn.addEventListener('click', async () => {
  const enabled = await window.clueless.toggleProtection();
  setUi(enabled);
});

void init();

export {};
