const QRCode = require('qrcode');

const generateQR = async (text) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR generation error:', err);
    return null;
  }
};

module.exports = { generateQR };
