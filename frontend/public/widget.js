(function() {
  // 1. Get the config from the script tag
  const currentScript = document.currentScript;
  const chatbotId = currentScript.getAttribute('data-chat-id');
  const baseUrl = new URL(currentScript.src).origin;

  if (!chatbotId) {
    console.error('SupportIQ: Missing data-chat-id attribute');
    return;
  }

  // 2. Inject CSS for the Bubble and Iframe
  const style = document.createElement('style');
  style.innerHTML = `
    #supportiq-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #supportiq-bubble {
      width: 60px;
      height: 60px;
      background-color: #6366F1; /* SupportIQ Indigo */
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      animation: supportiq-breathe 3s ease-in-out infinite;
    }
    #supportiq-bubble:hover {
      transform: scale(1.05);
      animation: none; /* Pause breathing on hover */
    }
    @keyframes supportiq-breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    #supportiq-bubble svg {
      width: 32px;
      height: 32px;
      color: white;
    }
    #supportiq-iframe {
      width: 400px;
      height: 600px;
      max-height: 80vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
      border: 1px solid #e4e4e7;
      display: none; /* Hidden by default */
      overflow: hidden;
    }
    /* Mobile Responsive */
    @media (max-width: 480px) {
      #supportiq-iframe {
        width: 90vw;
        height: 80vh;
        bottom: 90px;
        right: 5vw;
      }
    }
  `;
  document.head.appendChild(style);

  // 3. Create the Container
  const container = document.createElement('div');
  container.id = 'supportiq-container';

  // 4. Create the Iframe (Hidden initially)
  const iframe = document.createElement('iframe');
  iframe.id = 'supportiq-iframe';
  iframe.src = `${baseUrl}/widget/${chatbotId}`; // Points to Next.js page
  iframe.frameBorder = '0';

  // 5. Create the Bubble Button
  const bubble = document.createElement('div');
  bubble.id = 'supportiq-bubble';
  // Double Bubble Icon
  bubble.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <path d="M16 11h.01"></path>
      <path d="M12 11h.01"></path>
      <path d="M8 11h.01"></path>
    </svg>
  `;

  // 6. Toggle Logic
  let isOpen = false;
  bubble.onclick = () => {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
    // Change Icon (Chat vs X)
    bubble.innerHTML = isOpen 
      ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M16 11h.01"></path>
          <path d="M12 11h.01"></path>
          <path d="M8 11h.01"></path>
        </svg>`;
  };

  container.appendChild(iframe);
  container.appendChild(bubble);
  document.body.appendChild(container);
})();