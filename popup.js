// Function to generate the QR code and resize the popup
function generateQRCode(url) {
  const qrCodeContainer = document.getElementById("qr-code-container");

  // Clear any existing content
  qrCodeContainer.innerHTML = "";

  // Generate the QR code
  new QRCode(qrCodeContainer, {
    text: url,
    width: 256,
    height: 256
  });

  // Resize the popup to fit the QR code
  const size = 256 + 20; // Add padding
  window.resizeTo(size, size);
}

// Get the current page's URL and generate the QR code
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    generateQRCode(tabs[0].url);
  } else {
    document.getElementById("qr-code-container").innerText = "No URL found.";
  }
});