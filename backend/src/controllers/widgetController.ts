import { Request, Response } from 'express';
import { projectService } from '../services';
import config from '../config';

// SVG icons for the widget
const WIDGET_ICONS: Record<string, string> = {
  chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  question: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  thumbsUp: '<svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
  envelope: '<svg viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
};

// Position CSS mappings
const POSITION_STYLES: Record<string, { button: string; modal: string }> = {
  'top-left': {
    button: 'top: 24px; left: 24px; bottom: auto; right: auto;',
    modal: 'top: 100px; left: 24px; bottom: auto; right: auto; transform-origin: top left;'
  },
  'top-right': {
    button: 'top: 24px; right: 24px; bottom: auto; left: auto;',
    modal: 'top: 100px; right: 24px; bottom: auto; left: auto; transform-origin: top right;'
  },
  'bottom-left': {
    button: 'bottom: 24px; left: 24px; top: auto; right: auto;',
    modal: 'bottom: 100px; left: 24px; top: auto; right: auto; transform-origin: bottom left;'
  },
  'bottom-right': {
    button: 'bottom: 24px; right: 24px; top: auto; left: auto;',
    modal: 'bottom: 100px; right: 24px; top: auto; left: auto; transform-origin: bottom right;'
  },
};

/**
 * GET /widget.js
 * Serves the widget JavaScript file with customization
 */
export const serveWidget = async (req: Request, res: Response): Promise<void> => {
  const projectKey = req.query.key as string;

  if (!projectKey) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`console.error('[Feedback Pulse] Error: No project key provided');`);
    return;
  }

  // Get project with widget settings
  const project = await projectService.getProjectByKey(projectKey);

  if (!project) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`console.error('[Feedback Pulse] Error: Invalid project key');`);
    return;
  }

  // Check domain restriction
  const origin = req.get('origin') || req.get('referer');
  if (!projectService.isOriginAllowed(origin, project.allowedDomains)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`console.error('[Feedback Pulse] Error: This domain is not authorized to use this widget');`);
    return;
  }

  // Get widget settings from query params first (takes priority), then from project
  // Note: Express automatically decodes query params, no need for decodeURIComponent
  const customIconUrl = req.query.customIcon as string | undefined;

  const icon = (req.query.icon as string) || project.widgetIcon || 'chat';
  const buttonTextRaw = req.query.text as string | undefined;
  // Support icon-only mode: if text param is provided (even empty), use it; otherwise use project setting
  // No fallback to 'Feedback' if the project has no text set
  const buttonText = buttonTextRaw !== undefined ? buttonTextRaw : (project.widgetText || '');
  const showText = buttonText.length > 0;

  const primaryColor = (req.query.primary as string) || project.widgetPrimary || '#2563EB';
  const textColor = (req.query.textColor as string) || project.widgetTextColor || '#FFFFFF';
  const bgColor = (req.query.bg as string) || project.widgetBackground || '#FFFFFF';
  const position = (req.query.pos as string) || project.widgetPosition || 'bottom-right';

  const backendUrl = config.isProduction
    ? config.backendUrl
    : `http://localhost:${config.port}`;

  // Get the icon content - use custom icon URL if provided, otherwise use preset SVG
  let iconContent: string;
  if (customIconUrl) {
    // Use custom icon as an img tag - NO crossorigin attr (Google Drive blocks it)
    iconContent = `<img src="${customIconUrl}" alt="" style="width:20px;height:20px;object-fit:contain;">`;
  } else {
    // Use preset SVG icon
    iconContent = WIDGET_ICONS[icon] || WIDGET_ICONS.chat;
  }

  // Get position styles
  const posStyles = POSITION_STYLES[position] || POSITION_STYLES['bottom-right'];

  // Generate primary color with alpha for focus states
  const primaryRgb = hexToRgb(primaryColor);
  const primaryFocus = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)` : 'rgba(37, 99, 235, 0.15)';
  const primaryShadow = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)` : 'rgba(37, 99, 235, 0.4)';
  const primaryShadowHover = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)` : 'rgba(37, 99, 235, 0.5)';

  const widgetJs = `
(function() {
  // Prevent multiple initializations
  if (window.__feedbackPulseLoaded) return;
  window.__feedbackPulseLoaded = true;

  const PROJECT_KEY = '${projectKey}';
  const API_URL = '${backendUrl}/api/public/report';

  // Configuration
  const CONFIG = {
    primaryColor: '${primaryColor}',
    textColor: '${textColor}',
    bgColor: '${bgColor}',
    buttonText: '${buttonText}',
    primaryFocus: '${primaryFocus}',
    primaryShadow: '${primaryShadow}',
    primaryShadowHover: '${primaryShadowHover}',
  };

  // Styles
  const styles = \`
    #fp-widget-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: fixed;
      z-index: 999998;
    }
    #fp-widget-button {
      position: fixed;
      ${posStyles.button}
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 9999px;
      background: \${CONFIG.primaryColor};
      color: \${CONFIG.textColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px \${CONFIG.primaryShadow};
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999998;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
    }
    #fp-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px \${CONFIG.primaryShadowHover};
    }
    #fp-widget-button:focus {
      outline: none;
      box-shadow: 0 0 0 4px \${CONFIG.primaryFocus};
    }
    #fp-widget-button svg {
      width: 18px;
      height: 18px;
      fill: \${CONFIG.textColor};
      flex-shrink: 0;
    }
    #fp-widget-modal {
      position: fixed;
      ${posStyles.modal}
      width: 340px;
      max-width: calc(100vw - 48px);
      background: \${CONFIG.bgColor};
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      padding: 24px;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.95);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 999999;
      border: 1px solid #e2e8f0;
    }
    #fp-widget-modal.fp-open {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }
    #fp-widget-modal h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      font-family: inherit;
    }
    #fp-widget-modal .fp-desc {
      margin: 0 0 20px 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.4;
      font-weight: 500;
    }
    #fp-widget-modal label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    #fp-widget-modal select,
    #fp-widget-modal textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      color: #334155;
      outline: none;
      transition: all 0.2s;
      background: rgba(255, 255, 255, 0.8);
      box-sizing: border-box;
      margin-bottom: 16px;
    }
    #fp-widget-modal select:hover,
    #fp-widget-modal textarea:hover {
      border-color: #94a3b8;
    }
    #fp-widget-modal select:focus,
    #fp-widget-modal textarea:focus {
      border-color: \${CONFIG.primaryColor};
      box-shadow: 0 0 0 4px \${CONFIG.primaryFocus};
      background: #fff;
    }
    #fp-widget-modal textarea {
      min-height: 100px;
      resize: vertical;
    }
    #fp-widget-modal .fp-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    #fp-widget-modal button {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-family: inherit;
    }
    #fp-widget-cancel {
      background: transparent;
      color: #64748b;
    }
    #fp-widget-cancel:hover {
      background: #f1f5f9;
      color: #334155;
    }
    #fp-widget-submit {
      background: \${CONFIG.primaryColor};
      color: \${CONFIG.textColor};
      box-shadow: 0 4px 6px -1px \${CONFIG.primaryShadow};
    }
    #fp-widget-submit:hover {
      filter: brightness(0.9);
      transform: translateY(-1px);
    }
    #fp-widget-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    #fp-widget-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #cbd5e1;
      padding: 4px;
      display: flex;
      border-radius: 6px;
      transition: all 0.2s;
    }
    #fp-widget-close:hover {
      background: #f1f5f9;
      color: #64748b;
    }
    #fp-widget-success {
      text-align: center;
      padding: 20px 0;
      color: #059669;
      font-weight: 700;
      display: none;
    }
    #fp-widget-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      display: none;
    }
    #fp-widget-error.fp-show {
      display: block;
    }
    .fp-group {
      margin-bottom: 16px;
    }
    .fp-group:last-of-type {
      margin-bottom: 0;
    }
  \`;

  // Create style element
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Create floating button
  const button = document.createElement('button');
  button.id = 'fp-widget-button';
  button.innerHTML = '${iconContent}${showText ? `<span>${buttonText}</span>` : ''}';
  button.setAttribute('aria-label', 'Open feedback form');
  button.setAttribute('aria-expanded', 'false');
  document.body.appendChild(button);

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'fp-widget-modal';
  modal.innerHTML = \`
    <button id="fp-widget-close" aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div id="fp-widget-form-container">
      <h3>We value your feedback</h3>
      <p class="fp-desc">Found a bug? Have a suggestion? Let us know!</p>
      <div id="fp-widget-error"></div>
      <div class="fp-group">
        <label for="fp-widget-type">Type</label>
        <select id="fp-widget-type">
          <option value="Bug">Bug Report</option>
          <option value="Feature">Feature Request</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="fp-group">
        <label for="fp-widget-message">Message</label>
        <textarea id="fp-widget-message" placeholder="Tell us what you think..."></textarea>
      </div>
      <div class="fp-buttons">
        <button type="button" id="fp-widget-cancel">Cancel</button>
        <button type="button" id="fp-widget-submit">Send Feedback</button>
      </div>
    </div>
    <div id="fp-widget-success">Thank you! We've received your feedback.</div>
  \`;
  document.body.appendChild(modal);

  // Event handlers
  const typeSelect = document.getElementById('fp-widget-type');
  const messageTextarea = document.getElementById('fp-widget-message');
  const submitBtn = document.getElementById('fp-widget-submit');
  const cancelBtn = document.getElementById('fp-widget-cancel');
  const closeBtn = document.getElementById('fp-widget-close');
  const errorDiv = document.getElementById('fp-widget-error');
  const formContainer = document.getElementById('fp-widget-form-container');
  const successDiv = document.getElementById('fp-widget-success');

  let isOpen = false;

  function openModal() {
    isOpen = true;
    modal.classList.add('fp-open');
    button.setAttribute('aria-expanded', 'true');
    formContainer.style.display = 'block';
    successDiv.style.display = 'none';
    messageTextarea.value = '';
    typeSelect.value = 'Bug';
    errorDiv.classList.remove('fp-show');
    setTimeout(() => messageTextarea.focus(), 150);
  }

  function closeModal() {
    isOpen = false;
    modal.classList.remove('fp-open');
    button.setAttribute('aria-expanded', 'false');
  }

  function toggleModal() {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('fp-show');
  }

  async function submitFeedback() {
    const type = typeSelect.value;
    const message = messageTextarea.value.trim();

    if (message.length < 3) {
      showError('Please enter at least 3 characters.');
      return;
    }

    errorDiv.classList.remove('fp-show');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectKey: PROJECT_KEY,
          type: type,
          message: message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      formContainer.style.display = 'none';
      successDiv.style.display = 'block';

      setTimeout(() => {
        closeModal();
        submitBtn.textContent = 'Send Feedback';
        submitBtn.disabled = false;
      }, 3000);
    } catch (error) {
      showError(error.message || 'Something went wrong. Please try again.');
      submitBtn.textContent = 'Send Feedback';
      submitBtn.disabled = false;
    }
  }

  // Event listeners
  button.addEventListener('click', toggleModal);
  cancelBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  submitBtn.addEventListener('click', submitFeedback);

  // Handle Escape key
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && isOpen) {
      closeModal();
    }
  });

  // Close on click outside
  document.addEventListener('click', function(e) {
    if (isOpen && !modal.contains(e.target) && e.target !== button && !button.contains(e.target)) {
      closeModal();
    }
  });

  console.log('[Feedback Pulse] Widget loaded successfully');
})();
`;

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(widgetJs);
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}
