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

// Position CSS mappings for the floating button
const BUTTON_POSITIONS: Record<string, string> = {
  'top-left': 'top: 24px; left: 24px; bottom: auto; right: auto;',
  'top-right': 'top: 24px; right: 24px; bottom: auto; left: auto;',
  'bottom-left': 'bottom: 24px; left: 24px; top: auto; right: auto;',
  'bottom-right': 'bottom: 24px; right: 24px; top: auto; left: auto;',
};

// Position CSS mappings for the iframe
const IFRAME_POSITIONS: Record<string, string> = {
  'top-left': 'top: 90px; left: 24px; bottom: auto; right: auto;',
  'top-right': 'top: 90px; right: 24px; bottom: auto; left: auto;',
  'bottom-left': 'bottom: 90px; left: 24px; top: auto; right: auto;',
  'bottom-right': 'bottom: 90px; right: 24px; top: auto; left: auto;',
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

/**
 * GET /widget.js
 * Serves the widget JavaScript file that creates a floating button and iframe
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
  const customIconUrl = req.query.customIcon as string | undefined;
  const icon = (req.query.icon as string) || project.widgetIcon || 'chat';
  const buttonTextRaw = req.query.text as string | undefined;
  const buttonText = buttonTextRaw !== undefined ? buttonTextRaw : (project.widgetText || '');
  const showText = buttonText.length > 0;

  const primaryColor = (req.query.primary as string) || project.widgetPrimary || '#2563EB';
  const textColor = (req.query.textColor as string) || project.widgetTextColor || '#FFFFFF';
  const position = (req.query.pos as string) || project.widgetPosition || 'bottom-right';

  const backendUrl = config.isProduction
    ? config.backendUrl
    : `http://localhost:${config.port}`;

  // Get the icon content - use custom icon URL if provided, otherwise use preset SVG
  let iconContent: string;
  if (customIconUrl) {
    iconContent = `<img src="${customIconUrl}" alt="" style="width:20px;height:20px;object-fit:contain;">`;
  } else {
    iconContent = WIDGET_ICONS[icon] || WIDGET_ICONS.chat;
  }

  // Get position styles
  const buttonPos = BUTTON_POSITIONS[position] || BUTTON_POSITIONS['bottom-right'];
  const iframePos = IFRAME_POSITIONS[position] || IFRAME_POSITIONS['bottom-right'];

  // Generate primary color with alpha for focus states
  const primaryRgb = hexToRgb(primaryColor);
  const primaryShadow = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)` : 'rgba(37, 99, 235, 0.4)';
  const primaryShadowHover = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)` : 'rgba(37, 99, 235, 0.5)';
  const primaryFocus = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)` : 'rgba(37, 99, 235, 0.15)';

  // Build iframe URL with all params
  const iframeParams = new URLSearchParams({
    key: projectKey,
    primary: primaryColor,
    textColor: textColor,
    bg: (req.query.bg as string) || project.widgetBackground || '#FFFFFF',
  });

  const widgetJs = `
(function() {
  // Prevent multiple initializations
  if (window.__feedbackPulseLoaded) return;
  window.__feedbackPulseLoaded = true;

  var IFRAME_URL = '${backendUrl}/widget.html?${iframeParams.toString()}';

  // Minimal styles for the button only (no CSS conflicts possible)
  var style = document.createElement('style');
  style.textContent = \`
    #fp-widget-btn {
      all: initial;
      position: fixed !important;
      ${buttonPos}
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      padding: 12px 20px !important;
      border-radius: 9999px !important;
      background: ${primaryColor} !important;
      color: ${textColor} !important;
      border: none !important;
      cursor: pointer !important;
      box-shadow: 0 4px 20px ${primaryShadow} !important;
      transition: transform 0.2s, box-shadow 0.2s !important;
      z-index: 2147483646 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      box-sizing: border-box !important;
    }
    #fp-widget-btn:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 6px 25px ${primaryShadowHover} !important;
    }
    #fp-widget-btn:focus {
      outline: none !important;
      box-shadow: 0 0 0 4px ${primaryFocus} !important;
    }
    #fp-widget-btn svg {
      width: 18px !important;
      height: 18px !important;
      fill: ${textColor} !important;
      flex-shrink: 0 !important;
    }
    #fp-widget-btn span {
      color: ${textColor} !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    #fp-widget-iframe {
      all: initial;
      position: fixed !important;
      ${iframePos}
      width: 380px !important;
      height: 420px !important;
      max-width: calc(100vw - 48px) !important;
      border: none !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      z-index: 2147483647 !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform: scale(0.95) !important;
      transition: opacity 0.2s, visibility 0.2s, transform 0.2s !important;
      background: #fff !important;
    }
    #fp-widget-iframe.fp-open {
      opacity: 1 !important;
      visibility: visible !important;
      transform: scale(1) !important;
    }
  \`;
  document.head.appendChild(style);

  // Create floating button
  var btn = document.createElement('button');
  btn.id = 'fp-widget-btn';
  btn.innerHTML = '${iconContent}${showText ? `<span>${buttonText}</span>` : ''}';
  btn.setAttribute('aria-label', 'Open feedback form');
  btn.setAttribute('aria-expanded', 'false');
  document.body.appendChild(btn);

  // Create iframe (hidden initially)
  var iframe = document.createElement('iframe');
  iframe.id = 'fp-widget-iframe';
  iframe.src = IFRAME_URL;
  iframe.setAttribute('title', 'Feedback Form');
  iframe.setAttribute('loading', 'lazy');
  document.body.appendChild(iframe);

  var isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add('fp-open');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      iframe.classList.remove('fp-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function close() {
    if (isOpen) {
      isOpen = false;
      iframe.classList.remove('fp-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggle();
  });

  // Listen for messages from iframe
  window.addEventListener('message', function(e) {
    if (e.origin !== '${backendUrl.replace(/\/$/, '')}') return;
    if (e.data === 'fp-close') {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && isOpen) {
      close();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', function(e) {
    if (isOpen && e.target !== btn && !btn.contains(e.target)) {
      close();
    }
  });

  console.log('[Feedback Pulse] Widget loaded successfully');
})();
`;

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(widgetJs);
};

/**
 * GET /widget.html
 * Serves the widget HTML content for the iframe (completely isolated)
 */
export const serveWidgetHtml = async (req: Request, res: Response): Promise<void> => {
  const projectKey = req.query.key as string;

  if (!projectKey) {
    res.status(400).send('Missing project key');
    return;
  }

  const project = await projectService.getProjectByKey(projectKey);

  if (!project) {
    res.status(404).send('Invalid project key');
    return;
  }

  const primaryColor = (req.query.primary as string) || project.widgetPrimary || '#2563EB';
  const textColor = (req.query.textColor as string) || project.widgetTextColor || '#FFFFFF';
  const bgColor = (req.query.bg as string) || project.widgetBackground || '#FFFFFF';

  const backendUrl = config.isProduction
    ? config.backendUrl
    : `http://localhost:${config.port}`;

  // Generate primary color with alpha for focus states
  const primaryRgb = hexToRgb(primaryColor);
  const primaryFocus = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)` : 'rgba(37, 99, 235, 0.15)';
  const primaryShadow = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)` : 'rgba(37, 99, 235, 0.4)';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${bgColor};
      padding: 24px;
      min-height: 100vh;
    }
    .close-btn {
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
    .close-btn:hover {
      background: #f1f5f9;
      color: #64748b;
    }
    h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }
    .desc {
      margin: 0 0 20px 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.4;
      font-weight: 500;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    select, textarea {
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
      margin-bottom: 16px;
    }
    select:hover, textarea:hover {
      border-color: #94a3b8;
    }
    select:focus, textarea:focus {
      border-color: ${primaryColor};
      box-shadow: 0 0 0 4px ${primaryFocus};
      background: #fff;
    }
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    .buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    button {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-family: inherit;
    }
    .cancel-btn {
      background: transparent;
      color: #64748b;
    }
    .cancel-btn:hover {
      background: #f1f5f9;
      color: #334155;
    }
    .submit-btn {
      background: ${primaryColor};
      color: ${textColor};
      box-shadow: 0 4px 6px -1px ${primaryShadow};
    }
    .submit-btn:hover {
      filter: brightness(0.9);
      transform: translateY(-1px);
    }
    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      display: none;
    }
    .error.show { display: block; }
    .success {
      text-align: center;
      padding: 40px 20px;
      color: #059669;
      font-weight: 700;
      display: none;
    }
    .success.show { display: block; }
    .form-container.hidden { display: none; }
    .group { margin-bottom: 16px; }
    .group:last-of-type { margin-bottom: 0; }
  </style>
</head>
<body>
  <button class="close-btn" id="closeBtn" aria-label="Close">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>

  <div id="formContainer" class="form-container">
    <h3>We value your feedback</h3>
    <p class="desc">Found a bug? Have a suggestion? Let us know!</p>
    <div id="error" class="error"></div>
    <div class="group">
      <label for="type">Type</label>
      <select id="type">
        <option value="Bug">Bug Report</option>
        <option value="Feature">Feature Request</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div class="group">
      <label for="message">Message</label>
      <textarea id="message" placeholder="Tell us what you think..."></textarea>
    </div>
    <div class="buttons">
      <button type="button" class="cancel-btn" id="cancelBtn">Cancel</button>
      <button type="button" class="submit-btn" id="submitBtn">Send Feedback</button>
    </div>
  </div>

  <div id="success" class="success">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; display: block; color: #059669;">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    Thank you! We've received your feedback.
  </div>

  <script>
    var API_URL = '${backendUrl}/api/public/report';
    var PROJECT_KEY = '${projectKey}';

    var formContainer = document.getElementById('formContainer');
    var successDiv = document.getElementById('success');
    var errorDiv = document.getElementById('error');
    var typeSelect = document.getElementById('type');
    var messageTextarea = document.getElementById('message');
    var submitBtn = document.getElementById('submitBtn');
    var cancelBtn = document.getElementById('cancelBtn');
    var closeBtn = document.getElementById('closeBtn');

    function sendClose() {
      window.parent.postMessage('fp-close', '*');
    }

    function showError(msg) {
      errorDiv.textContent = msg;
      errorDiv.classList.add('show');
    }

    function resetForm() {
      formContainer.classList.remove('hidden');
      successDiv.classList.remove('show');
      errorDiv.classList.remove('show');
      messageTextarea.value = '';
      typeSelect.value = 'Bug';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }

    closeBtn.addEventListener('click', sendClose);
    cancelBtn.addEventListener('click', sendClose);

    submitBtn.addEventListener('click', async function() {
      var type = typeSelect.value;
      var message = messageTextarea.value.trim();

      if (message.length < 3) {
        showError('Please enter at least 3 characters.');
        return;
      }

      errorDiv.classList.remove('show');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        var response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectKey: PROJECT_KEY,
            type: type,
            message: message
          })
        });

        var data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to submit feedback');
        }

        formContainer.classList.add('hidden');
        successDiv.classList.add('show');

        setTimeout(function() {
          sendClose();
          setTimeout(resetForm, 300);
        }, 2500);
      } catch (err) {
        showError(err.message || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
      }
    });

    // Auto-focus the textarea when opened
    setTimeout(function() { messageTextarea.focus(); }, 100);
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(html);
};