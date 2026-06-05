-- Migration: 002_pickup_requests.sql
-- Pickup scheduling table for EcoFlow

CREATE TABLE IF NOT EXISTS PickupRequests (
  Request_ID     INT AUTO_INCREMENT PRIMARY KEY,
  Bin_ID         INT NOT NULL,
  Requested_By   VARCHAR(255) NOT NULL,
  Scheduled_Date DATE NOT NULL,
  Status         ENUM('pending', 'confirmed', 'completed') NOT NULL DEFAULT 'pending',
  Notes          TEXT NULL,
  Created_At     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pickup_bin FOREIGN KEY (Bin_ID) REFERENCES Bin (Bin_ID) ON DELETE CASCADE
);
