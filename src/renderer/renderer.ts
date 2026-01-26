declare global {
  interface Window {
    clueless: {
      toggleProtection: () => Promise<StatusPayload>;
      toggleAutoHide: () => Promise<StatusPayload>;
      getStatus: () => Promise<StatusPayload>;
      onStatus: (listener: (status: StatusPayload) => void) => () => void;
    };
  }
}

type StatusPayload = {
  manualProtectionEnabled: boolean;
  effectiveProtection: boolean;
  autoHideEnabled: boolean;
  shareGuardActive: boolean;
  isHidden: boolean;
};

const protectionEl = document.getElementById('protection-status');
const guardEl = document.getElementById('guard-status');
const autoHideEl = document.getElementById('auto-hide-status');
const visibilityEl = document.getElementById('visibility-status');
const protectionBtn = document.getElementById('toggle-protection');
const autoHideBtn = document.getElementById('toggle-auto-hide');

if (
  !(protectionEl instanceof HTMLElement) ||
  !(guardEl instanceof HTMLElement) ||
  !(autoHideEl instanceof HTMLElement) ||
  !(visibilityEl instanceof HTMLElement) ||
  !(protectionBtn instanceof HTMLButtonElement) ||
  !(autoHideBtn instanceof HTMLButtonElement)
) {
  throw new Error('Missing UI elements.');
}

const setUi = (status: StatusPayload) => {
  const protectionLabel =
    status.effectiveProtection && !status.manualProtectionEnabled && status.shareGuardActive
      ? 'ON (auto)'
      : status.effectiveProtection
        ? 'ON'
        : 'OFF';

  document.body.dataset.enabled = status.effectiveProtection ? 'on' : 'off';
  protectionEl.textContent = protectionLabel;
  guardEl.textContent = status.shareGuardActive ? 'ACTIVE' : 'IDLE';
  autoHideEl.textContent = status.autoHideEnabled ? 'ON' : 'OFF';
  visibilityEl.textContent = status.isHidden ? 'HIDDEN' : 'VISIBLE';

  protectionBtn.textContent = status.manualProtectionEnabled
    ? 'Disable Protection'
    : 'Enable Protection';
  autoHideBtn.textContent = status.autoHideEnabled ? 'Disable Auto-Hide' : 'Enable Auto-Hide';
};

const init = async () => {
  const status = await window.clueless.getStatus();
  setUi(status);
};

protectionBtn.addEventListener('click', async () => {
  const status = await window.clueless.toggleProtection();
  setUi(status);
});

autoHideBtn.addEventListener('click', async () => {
  const status = await window.clueless.toggleAutoHide();
  setUi(status);
});

window.clueless.onStatus((status) => {
  setUi(status);
});

void init();

export {};
