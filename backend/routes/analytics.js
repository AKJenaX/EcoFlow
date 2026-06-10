import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { executeQuery } from '../db.js';
import { generateCSV, generatePDF } from '../services/exportService.js';

const router = express.Router();

function pct(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

router.get(
  '/kpi-summary',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (_req, res) => {
    const [[incidents]] = await executeQuery(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status IN ('resolved','closed') THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS active
       FROM incidents`
    );
    const [[telemetry]] = await executeQuery(
      `SELECT
        COUNT(DISTINCT bin_id) AS active_bins,
        AVG(fill_pct) AS avg_fill,
        SUM(CASE WHEN fill_pct >= 85 OR smoke_detected = true OR tilt_detected = true THEN 1 ELSE 0 END) AS risky_events
       FROM telemetry_events`
    );
    const [[complaints]] = await executeQuery(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status IN ('resolved','closed') THEN 1 ELSE 0 END) AS resolved
       FROM complaints`
    );

    const incidentTotal = Number(incidents.total || 0);
    const complaintTotal = Number(complaints.total || 0);

    res.json({
      efficiency: {
        current: `${incidentTotal ? pct((Number(incidents.resolved || 0) / incidentTotal) * 100) : 0}%`,
        change: 0
      },
      activeBins: {
        current: Number(telemetry.active_bins || 0),
        change: 0
      },
      riskEvents: {
        current: Number(telemetry.risky_events || 0),
        change: 0
      },
      complaintResolution: {
        current: `${complaintTotal ? pct((Number(complaints.resolved || 0) / complaintTotal) * 100) : 0}%`,
        change: 0
      }
    });
  })
);

router.get(
  '/performance',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (_req, res) => {
    const [[incidentStats]] = await executeQuery(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN severity = 'critical' AND status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS critical_active
       FROM incidents`
    );
    const [[telemetryStats]] = await executeQuery(
      `SELECT AVG(fill_pct) AS avg_fill, AVG(battery_pct) AS avg_battery
       FROM telemetry_events`
    );
    const [[complaintStats]] = await executeQuery(
      `SELECT COUNT(*) AS open_count
       FROM complaints
       WHERE status NOT IN ('resolved','closed')`
    );

    const active = Number(incidentStats.active || 0);
    const critical = Number(incidentStats.critical_active || 0);
    const avgFill = pct(telemetryStats.avg_fill);
    const avgBattery = pct(telemetryStats.avg_battery);

    res.json([
      { name: 'Open incidents', current: active, target: '< 10', status: critical > 0 ? 'critical' : active > 10 ? 'warning' : 'success' },
      { name: 'Average bin fill', current: `${avgFill}%`, target: '< 75%', status: avgFill >= 85 ? 'critical' : avgFill >= 75 ? 'warning' : 'success' },
      { name: 'Average sensor battery', current: `${avgBattery}%`, target: '> 40%', status: avgBattery <= 20 ? 'critical' : avgBattery <= 40 ? 'warning' : 'success' },
      { name: 'Open complaints', current: Number(complaintStats.open_count || 0), target: '< 20', status: Number(complaintStats.open_count || 0) > 20 ? 'warning' : 'success' }
    ]);
  })
);

router.get(
  '/trends',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (_req, res) => {
    const [rows] = await executeQuery(
      `SELECT period_date, zone_name, sla_adherence_pct, fleet_utilization_pct, overflow_reduction_pct
       FROM kpi_snapshots
       ORDER BY period_date DESC
       LIMIT 30`
    );
    res.json(rows.reverse());
  })
);

router.post(
  '/report',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (req, res) => {
    res.json({
      message: 'Report request accepted',
      requestedAt: new Date().toISOString(),
      params: req.body || {}
    });
  })
);

router.get(
  '/overview',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (_req, res) => {
    const [[incidentStats]] = await executeQuery(
      `SELECT
        COUNT(*) AS total_incidents,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical_incidents,
        SUM(CASE WHEN status IN ('resolved','closed') THEN 1 ELSE 0 END) AS resolved_incidents
      FROM incidents`
    );
    const [[telemetryStats]] = await executeQuery(
      `SELECT
        COUNT(DISTINCT bin_id) AS total_bins,
        AVG(fill_pct) AS avg_fill_pct
      FROM telemetry_events`
    );
    res.json({ incidentStats, telemetryStats });
  })
);

router.get(
  '/zone-scorecard',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (_req, res) => {
    const [rows] = await executeQuery(
      `SELECT zone_name,
              AVG(sla_adherence_pct) AS avg_sla_adherence_pct,
              AVG(fleet_utilization_pct) AS avg_fleet_utilization_pct,
              AVG(missed_pickup_recurrence_pct) AS avg_missed_pickup_recurrence_pct
       FROM kpi_snapshots
       GROUP BY zone_name`
    );
    res.json(rows);
  })
);

router.post(
  '/kpi/snapshot',
  requireAuth,
  requirePermission('analytics.write'),
  asyncHandler(async (req, res) => {
    const {
      period_date,
      zone_name,
      overflow_reduction_pct,
      sla_adherence_pct,
      fuel_cost_per_ton,
      avg_complaint_response_minutes,
      fleet_utilization_pct,
      missed_pickup_recurrence_pct
    } = req.body || {};

    const [result] = await executeQuery(
      `INSERT INTO kpi_snapshots
      (period_date, zone_name, overflow_reduction_pct, sla_adherence_pct, fuel_cost_per_ton,
       avg_complaint_response_minutes, fleet_utilization_pct, missed_pickup_recurrence_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        period_date,
        zone_name || null,
        overflow_reduction_pct ?? null,
        sla_adherence_pct ?? null,
        fuel_cost_per_ton ?? null,
        avg_complaint_response_minutes ?? null,
        fleet_utilization_pct ?? null,
        missed_pickup_recurrence_pct ?? null
      ]
    );
    res.json({ message: 'KPI snapshot created', id: result.insertId });
  })
);

router.get(
  '/kpi/snapshots',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (_req, res) => {
    const [rows] = await executeQuery('SELECT * FROM kpi_snapshots ORDER BY period_date DESC');
    res.json(rows);
  })
);

// ── Export helpers ──────────────────────────────────────────────────────────

function buildDateFilter(range) {
  if (range === '7d') return `AND period_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
  if (range === '30d') return `AND period_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
  return ''; // 'all' or missing → no filter
}

const EXPORT_COLUMNS = [
  'period_date', 'zone_name', 'overflow_reduction_pct',
  'sla_adherence_pct', 'fuel_cost_per_ton',
  'avg_complaint_response_minutes', 'fleet_utilization_pct',
  'missed_pickup_recurrence_pct'
];

/**
 * GET /analytics/export/csv?range=7d|30d|all
 */
router.get(
  '/export/csv',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (req, res) => {
    const range = req.query.range || 'all';
    const [rows] = await executeQuery(
      `SELECT ${EXPORT_COLUMNS.join(', ')} FROM kpi_snapshots WHERE 1=1 ${buildDateFilter(range)} ORDER BY period_date DESC`
    );
    const csv = generateCSV(rows, EXPORT_COLUMNS);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ecoflow-analytics-${range}-${Date.now()}.csv"`);
    res.send(csv);
  })
);

/**
 * GET /analytics/export/pdf?range=7d|30d|all
 */
router.get(
  '/export/pdf',
  requireAuth,
  requirePermission('analytics.read'),
  asyncHandler(async (req, res) => {
    const range = req.query.range || 'all';
    const [rows] = await executeQuery(
      `SELECT ${EXPORT_COLUMNS.join(', ')} FROM kpi_snapshots WHERE 1=1 ${buildDateFilter(range)} ORDER BY period_date DESC`
    );
    const pdfBuf = await generatePDF(
      `EcoFlow Analytics Report (${range})`,
      rows,
      EXPORT_COLUMNS
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ecoflow-analytics-${range}-${Date.now()}.pdf"`);
    res.send(pdfBuf);
  })
);

export default router;
