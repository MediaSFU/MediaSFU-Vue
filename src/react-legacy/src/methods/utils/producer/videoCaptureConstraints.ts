// Landscape display sizes
let QnHDCons = { width: { ideal: 320 }, height: { ideal: 180 } };
let sdCons = { width: { ideal: 640 }, height: { ideal: 360 } };
let hdCons = { width: { ideal: 1280 }, height: { ideal: 720 } };
let fhdCons = { width: { ideal: 1920 }, height: { ideal: 1080 } };
let qhdCons = { width: { ideal: 2560 }, height: { ideal: 1440 } };

// Portrait display sizes
let QnHDConsPort = { width: { ideal: 180 }, height: { ideal: 320 } };
let sdConsPort = { width: { ideal: 360 }, height: { ideal: 640 } };
let hdConsPort = { width: { ideal: 720 }, height: { ideal: 1280 } };
let fhdConsPort = { width: { ideal: 1080 }, height: { ideal: 1920 } };
let qhdConsPort = { width: { ideal: 1440 }, height: { ideal: 2560 } };

// Neutral (Square) display sizes
let QnHDConsNeu = { width: { ideal: 240 }, height: { ideal: 240 } };
let sdConsNeu = { width: { ideal: 480 }, height: { ideal: 480 } };
let hdConsNeu = { width: { ideal: 960 }, height: { ideal: 960 } };
let fhdConsNeu = { width: { ideal: 1440 }, height: { ideal: 1440 } };
let qhdConsNeu = { width: { ideal: 1920 }, height: { ideal: 1920 } };

//frameRates for video capture
let QnHDFrameRate = 5;
let sdFrameRate = 10;
let hdFrameRate = 15;
let fhdFrameRate = 20;
let qhdFrameRate = 30;
let screenFrameRate = 30;

/**
 * Exports various video capture constraints and frame rates.
 * 
 * @exports
 * - `QnHDCons`: Constraints for Quarter HD resolution.
 * - `sdCons`: Constraints for Standard Definition resolution.
 * - `hdCons`: Constraints for High Definition resolution.
 * - `fhdCons`: Constraints for Full HD resolution.
 * - `qhdCons`: Constraints for Quad HD resolution.
 * - `QnHDConsPort`: Constraints for Quarter HD resolution (portrait mode).
 * - `sdConsPort`: Constraints for Standard Definition resolution (portrait mode).
 * - `hdConsPort`: Constraints for High Definition resolution (portrait mode).
 * - `fhdConsPort`: Constraints for Full HD resolution (portrait mode).
 * - `qhdConsPort`: Constraints for Quad HD resolution (portrait mode).
 * - `QnHDConsNeu`: Constraints for Quarter HD resolution (neutral mode).
 * - `sdConsNeu`: Constraints for Standard Definition resolution (neutral mode).
 * - `hdConsNeu`: Constraints for High Definition resolution (neutral mode).
 * - `fhdConsNeu`: Constraints for Full HD resolution (neutral mode).
 * - `qhdConsNeu`: Constraints for Quad HD resolution (neutral mode).
 * - `QnHDFrameRate`: Frame rate for Quarter HD resolution.
 * - `sdFrameRate`: Frame rate for Standard Definition resolution.
 * - `hdFrameRate`: Frame rate for High Definition resolution.
 * - `fhdFrameRate`: Frame rate for Full HD resolution.
 * - `qhdFrameRate`: Frame rate for Quad HD resolution.
 * - `screenFrameRate`: Frame rate for screen capture.
 * 
 */
export {
  QnHDCons,
  sdCons,
  hdCons,
  fhdCons,
  qhdCons,
  QnHDConsPort,
  sdConsPort,
  hdConsPort,
  fhdConsPort,
  qhdConsPort,
  QnHDConsNeu,
  sdConsNeu,
  hdConsNeu,
  fhdConsNeu,
  qhdConsNeu,
  QnHDFrameRate,
  sdFrameRate,
  hdFrameRate,
  fhdFrameRate,
  qhdFrameRate,
  screenFrameRate,
};
