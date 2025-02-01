// Add a context menu item for links
chrome.contextMenus.create({
  id: "generateQRCode",
  title: "Generate QR Code",
  contexts: ["link"]
});

// Handle context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateQRCode" && info.linkUrl) {
    // Inject the qrcode.js library first
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['qrcode.js']
    }).then(() => {
      // Then inject and execute the QR code generator function
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: generateQRCode,
        args: [info.linkUrl]
      });
    }).catch(err => {
      console.error('Script injection failed:', err);
    });
  }
});

// Function to generate and display a QR code
function generateQRCode(url) {
  // Check if QR code container already exists
  let existingContainer = document.getElementById('context-qr-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create a container for the QR code
  const qrCodeContainer = document.createElement("div");
  qrCodeContainer.id = 'context-qr-container';
  qrCodeContainer.style.position = "fixed";
  qrCodeContainer.style.left = "50%";
  qrCodeContainer.style.top = "50%";
  qrCodeContainer.style.transform = "translate(-50%, -50%)";
  qrCodeContainer.style.backgroundColor = "white";
  qrCodeContainer.style.border = "1px solid black";
  qrCodeContainer.style.padding = "10px";
  qrCodeContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  qrCodeContainer.style.zIndex = "2147483647"; // Maximum z-index value

  // Add a close button
  const closeButton = document.createElement("div");
  closeButton.style.position = "absolute";
  closeButton.style.top = "5px";
  closeButton.style.right = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "16px";
  closeButton.innerHTML = "×";
  closeButton.onclick = (e) => {
    e.stopPropagation();
    qrCodeContainer.remove();
  };
  qrCodeContainer.appendChild(closeButton);

  // Create a div for the QR code
  const qrDiv = document.createElement("div");
  qrCodeContainer.appendChild(qrDiv);

  // Generate the QR code with doubled size
  new QRCode(qrDiv, {
    text: url,
    width: 256,    // Doubled from 128
    height: 256    // Doubled from 128
  });

  // Add the QR code to the page
  document.body.appendChild(qrCodeContainer);

  // Make container draggable
  qrCodeContainer.style.cursor = 'move';
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  qrCodeContainer.onmousedown = dragStart;

  function dragStart(e) {
    if (e.target === closeButton) return;
    
    initialX = e.clientX - qrCodeContainer.offsetLeft;
    initialY = e.clientY - qrCodeContainer.offsetTop;
    
    if (e.target === qrCodeContainer) {
      isDragging = true;
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      // Keep within viewport bounds
      const containerWidth = qrCodeContainer.offsetWidth;
      const containerHeight = qrCodeContainer.offsetHeight;
      currentX = Math.min(Math.max(currentX, 0), window.innerWidth - containerWidth);
      currentY = Math.min(Math.max(currentY, 0), window.innerHeight - containerHeight);
      
      qrCodeContainer.style.left = currentX + "px";
      qrCodeContainer.style.top = currentY + "px";
      qrCodeContainer.style.transform = 'none'; // Remove centering transform when dragging
    }
  }

  function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  // Remove the QR code when clicked outside
  document.addEventListener("click", function onClick(e) {
    if (!qrCodeContainer.contains(e.target)) {
      qrCodeContainer.remove();
      document.removeEventListener("click", onClick);
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
    }
  });
}