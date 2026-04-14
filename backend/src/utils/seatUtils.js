/**
 * Sinh danh sách tên ghế từ layout phòng chiếu
 * rows=8, columns=10 → A1..A10, B1..B10, ...H1..H10
 * aisles = [4] → sau cột 4 có khoảng trống (không ảnh hưởng tên ghế)
 */
const generateSeatLabels = (rows, columns) => {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r); // A, B, C...
    for (let c = 1; c <= columns; c++) {
      seats.push(`${rowLabel}${c}`);
    }
  }
  return seats;
};

/**
 * Kiểm tra ghế có hợp lệ không trong layout
 */
const isSeatValid = (seatNumber, rows, columns) => {
  const rowChar = seatNumber[0];
  const colNum = parseInt(seatNumber.slice(1));
  const rowIndex = rowChar.charCodeAt(0) - 65; // A=0, B=1...
  return rowIndex >= 0 && rowIndex < rows && colNum >= 1 && colNum <= columns;
};

module.exports = { generateSeatLabels, isSeatValid };
