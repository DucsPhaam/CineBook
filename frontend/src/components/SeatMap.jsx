import React, { useState, useMemo } from 'react';

const SEAT_ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const SeatMap = ({ room, soldSeats = [], lockedSeats = [], onSeatSelect, selectedSeats = [] }) => {
  const rows = room?.layout?.rows || 8;
  const columns = room?.layout?.columns || 10;
  const aisles = room?.layout?.aisles || [];

  // Sinh tất cả ghế
  const allSeats = useMemo(() => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 1; c <= columns; c++) {
        const seatId = `${SEAT_ROWS[r]}${c}`;
        row.push({
          id: seatId,
          row: SEAT_ROWS[r],
          col: c,
          status: soldSeats.includes(seatId)
            ? 'sold'
            : lockedSeats.includes(seatId)
            ? 'locked'
            : selectedSeats.includes(seatId)
            ? 'selected'
            : 'available',
          aisle: aisles.includes(c) // lối đi sau cột này
        });
      }
      seats.push(row);
    }
    return seats;
  }, [rows, columns, soldSeats, lockedSeats, selectedSeats, aisles]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'sold' || seat.status === 'locked') return;
    onSeatSelect && onSeatSelect(seat.id);
  };

  const getSeatClass = (seat) => {
    let cls = 'seat';
    if (seat.status === 'sold') cls += ' seat-sold';
    else if (seat.status === 'locked') cls += ' seat-locked';
    else if (seat.status === 'selected') cls += ' seat-selected';
    else cls += ' seat-available';
    return cls;
  };

  return (
    <div className="seat-map-wrap">
      {/* Screen */}
      <div className="screen-wrap">
        <div className="screen" />
        <span className="screen-label">MÀN HÌNH</span>
      </div>

      {/* Seats Grid */}
      <div className="seat-grid">
        {allSeats.map((row, rIdx) => (
          <div key={rIdx} className="seat-row">
            <span className="row-label">{SEAT_ROWS[rIdx]}</span>
            <div className="seats-in-row">
              {row.map((seat) => (
                <React.Fragment key={seat.id}>
                  <button
                    className={getSeatClass(seat)}
                    onClick={() => handleSeatClick(seat)}
                    title={`${seat.id} - ${
                      seat.status === 'sold' ? 'Đã bán' :
                      seat.status === 'locked' ? 'Đang giữ' :
                      seat.status === 'selected' ? 'Đang chọn' : 'Trống'
                    }`}
                    disabled={seat.status === 'sold' || seat.status === 'locked'}
                  >
                    <span className="seat-label">{seat.col}</span>
                  </button>
                  {seat.aisle && <div className="aisle" />}
                </React.Fragment>
              ))}
            </div>
            <span className="row-label">{SEAT_ROWS[rIdx]}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-seat seat-available" />
          <span>Trống</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-selected" />
          <span>Đang chọn</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-locked" />
          <span>Đang giữ</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-sold" />
          <span>Đã bán</span>
        </div>
      </div>

      <style>{`
        .seat-map-wrap {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 32px 24px;
          border: 1px solid var(--border);
          overflow-x: auto;
        }
        .screen-wrap {
          text-align: center;
          margin-bottom: 40px;
        }
        .screen {
          height: 6px;
          background: linear-gradient(90deg, transparent, rgba(229,9,20,0.6), var(--primary), rgba(229,9,20,0.6), transparent);
          border-radius: 50%;
          margin: 0 auto 8px;
          max-width: 80%;
          box-shadow: 0 0 30px rgba(229,9,20,0.4), 0 0 60px rgba(229,9,20,0.15);
        }
        .screen-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          color: var(--text-muted);
        }
        .seat-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: fit-content;
          margin: 0 auto;
          width: fit-content;
        }
        .seat-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .row-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }
        .seats-in-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .aisle {
          width: 16px;
          flex-shrink: 0;
        }
        .seat {
          width: 34px;
          height: 34px;
          border-radius: 6px 6px 2px 2px;
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .seat-label {
          font-size: 9px;
        }
        .seat-available {
          background: var(--seat-available);
          border-color: rgba(30, 58, 95, 0.5);
          color: #5a8bbf;
        }
        .seat-available:hover {
          background: var(--seat-available-hover);
          border-color: #3a6fa0;
          color: #fff;
          transform: scale(1.15);
          box-shadow: 0 0 12px rgba(30, 58, 95, 0.5);
        }
        .seat-selected {
          background: var(--seat-selected);
          border-color: var(--primary-light);
          color: white;
          box-shadow: 0 0 12px var(--primary-glow);
          transform: scale(1.05);
        }
        .seat-selected:hover {
          background: var(--seat-selected-hover);
          transform: scale(1.15);
        }
        .seat-locked {
          background: var(--seat-locked);
          border-color: rgba(245, 197, 24, 0.3);
          color: rgba(245,197,24,0.5);
          cursor: not-allowed;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .seat-sold {
          background: var(--seat-sold);
          border-color: var(--seat-sold-border);
          color: var(--text-muted);
          cursor: not-allowed;
          opacity: 0.6;
        }
        .seat-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .legend-seat {
          width: 22px;
          height: 22px;
          border-radius: 4px 4px 2px 2px;
          border: 1px solid transparent;
        }
        .legend-seat.seat-available {
          background: var(--seat-available);
          border-color: rgba(30,58,95,0.5);
        }
        .legend-seat.seat-selected {
          background: var(--seat-selected);
          border-color: var(--primary-light);
        }
        .legend-seat.seat-locked {
          background: var(--seat-locked);
          border-color: rgba(245,197,24,0.3);
        }
        .legend-seat.seat-sold {
          background: var(--seat-sold);
          border-color: var(--seat-sold-border);
        }
        @media (max-width: 600px) {
          .seat { width: 28px; height: 28px; }
          .seat-map-wrap { padding: 20px 12px; }
        }
      `}</style>
    </div>
  );
};

export default SeatMap;
