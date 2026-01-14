import { Request, Response } from 'express';
import { projectService } from '../services';
import config from '../config';

/**
 * GET /widget.js
 * Serves the widget JavaScript file
 */
export const serveWidget = async (req: Request, res: Response): Promise<void> => {
  const projectKey = req.query.key as string;

  if (!projectKey) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`console.error('[Feedback Pulse] Error: No project key provided');`);
    return;
  }

  // Verify project exists
  const project = await projectService.getProjectByKey(projectKey);

  if (!project) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`console.error('[Feedback Pulse] Error: Invalid project key');`);
    return;
  }

  const backendUrl = config.isProduction
    ? process.env.BACKEND_URL || 'https://your-backend.onrender.com'
    : `http://localhost:${config.port}`;

  const widgetJs = `
(function() {
  // Prevent multiple initializations
  if (window.__feedbackPulseLoaded) return;
  window.__feedbackPulseLoaded = true;

  const PROJECT_KEY = '${projectKey}';
  const API_URL = '${backendUrl}/api/public/feedback';

  // Styles
  const styles = \`
    #fp-widget-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #3b82f6;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999998;
    }
    #fp-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5);
    }
    #fp-widget-button svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
    #fp-widget-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: none;
      align-items: center;
      justify-content: center;
    }
    #fp-widget-overlay.fp-open {
      display: flex;
    }
    #fp-widget-modal {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 440px;
      padding: 28px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: fp-slide-up 0.3s ease-out;
    }
    @keyframes fp-slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #fp-widget-modal h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #fp-widget-modal label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #fp-widget-modal select,
    #fp-widget-modal textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin-bottom: 16px;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #fp-widget-modal select:focus,
    #fp-widget-modal textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    #fp-widget-modal textarea {
      min-height: 120px;
      resize: vertical;
    }
    #fp-widget-modal .fp-buttons {
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }
    #fp-widget-modal button {
      flex: 1;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #fp-widget-cancel {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      color: #374151;
    }
    #fp-widget-cancel:hover {
      background: #e5e7eb;
    }
    #fp-widget-submit {
      background: #3b82f6;
      border: none;
      color: white;
    }
    #fp-widget-submit:hover {
      opacity: 0.9;
    }
    #fp-widget-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    #fp-widget-success {
      text-align: center;
      padding: 20px 0;
    }
    #fp-widget-success svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    #fp-widget-success h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #fp-widget-success p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #fp-widget-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: none;
    }
    #fp-widget-error.fp-show {
      display: block;
    }
  \`;

  // Create style element
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Create floating button
  const button = document.createElement('button');
  button.id = 'fp-widget-button';
  button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
  button.setAttribute('aria-label', 'Open feedback form');
  document.body.appendChild(button);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'fp-widget-overlay';
  overlay.innerHTML = \`
    <div id="fp-widget-modal">
      <div id="fp-widget-form-container">
        <h3>Share Your Feedback</h3>
        <div id="fp-widget-error"></div>
        <label for="fp-widget-type">Type</label>
        <select id="fp-widget-type">
          <option value="Bug">Bug Report</option>
          <option value="Feature">Feature Request</option>
          <option value="Other">Other</option>
        </select>
        <label for="fp-widget-message">Message</label>
        <textarea id="fp-widget-message" placeholder="Describe your feedback..."></textarea>
        <div class="fp-buttons">
          <button type="button" id="fp-widget-cancel">Cancel</button>
          <button type="button" id="fp-widget-submit">Submit</button>
        </div>
      </div>
      <div id="fp-widget-success" style="display: none;">
        <svg viewBox="0 0 24 24" fill="#10b981"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <h4>Thank you!</h4>
        <p>Your feedback has been submitted successfully.</p>
      </div>
    </div>
  \`;
  document.body.appendChild(overlay);

  // Event handlers
  const typeSelect = document.getElementById('fp-widget-type');
  const messageTextarea = document.getElementById('fp-widget-message');
  const submitBtn = document.getElementById('fp-widget-submit');
  const cancelBtn = document.getElementById('fp-widget-cancel');
  const errorDiv = document.getElementById('fp-widget-error');
  const formContainer = document.getElementById('fp-widget-form-container');
  const successDiv = document.getElementById('fp-widget-success');

  function openModal() {
    overlay.classList.add('fp-open');
    formContainer.style.display = 'block';
    successDiv.style.display = 'none';
    messageTextarea.value = '';
    typeSelect.value = 'Bug';
    errorDiv.classList.remove('fp-show');
  }

  function closeModal() {
    overlay.classList.remove('fp-open');
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
    submitBtn.textContent = 'Submitting...';

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

      setTimeout(closeModal, 2000);
    } catch (error) {
      showError(error.message || 'Something went wrong. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  }

  button.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });
  submitBtn.addEventListener('click', submitFeedback);

  // Handle Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('fp-open')) {
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
