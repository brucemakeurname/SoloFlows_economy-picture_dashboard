<?php
// ============================================================
// Economy Picture Dashboard - Summary API
// GET: Aggregated dashboard data for a given ?period=
// Returns totals, breakdowns, and monthly trends
// ============================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------
    // GET - Aggregated dashboard summary
    // Parameter: ?period= (e.g., 2026-02). If omitted, uses all periods.
    // -------------------------------------------------------
    case 'GET':
        $period = $_GET['period'] ?? null;

        // ===================================================
        // 1. Category totals (revenue, cogs, opex, capex)
        // ===================================================
        $sqlTotals = "
            SELECT
                c.type AS category_type,
                COALESCE(SUM(le.actual), 0) AS total_actual,
                COALESCE(SUM(le.budget), 0) AS total_budget
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
        ";
        $paramsTotals = [];

        if ($period) {
            $sqlTotals .= " WHERE le.period = :period";
            $paramsTotals[':period'] = $period;
        }

        $sqlTotals .= " GROUP BY c.type";

        $stmt = $pdo->prepare($sqlTotals);
        $stmt->execute($paramsTotals);
        $totalsRaw = $stmt->fetchAll();

        // Map to named totals
        $totals = [
            'total_revenue' => 0,
            'total_cogs'    => 0,
            'total_opex'    => 0,
            'total_capex'   => 0,
        ];
        $budgets = [
            'budget_revenue' => 0,
            'budget_cogs'    => 0,
            'budget_opex'    => 0,
            'budget_capex'   => 0,
        ];

        foreach ($totalsRaw as $row) {
            $key = 'total_' . $row['category_type'];
            $budgetKey = 'budget_' . $row['category_type'];
            if (isset($totals[$key])) {
                $totals[$key] = (float) $row['total_actual'];
                $budgets[$budgetKey] = (float) $row['total_budget'];
            }
        }

        // Computed metrics
        $netProfit = $totals['total_revenue'] - $totals['total_cogs'] - $totals['total_opex'];
        $burnRate  = $totals['total_cogs'] + $totals['total_opex'];

        // ===================================================
        // 2. Revenue by period
        // ===================================================
        $sqlRevByPeriod = "
            SELECT
                le.period,
                COALESCE(SUM(le.actual), 0) AS total_revenue
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
            WHERE c.type = 'revenue'
            GROUP BY le.period
            ORDER BY le.period ASC
        ";
        $stmt = $pdo->query($sqlRevByPeriod);
        $revenueByPeriod = $stmt->fetchAll();

        // ===================================================
        // 3. Expense by period (cogs + opex)
        // ===================================================
        $sqlExpByPeriod = "
            SELECT
                le.period,
                COALESCE(SUM(le.actual), 0) AS total_expense
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
            WHERE c.type IN ('cogs', 'opex')
            GROUP BY le.period
            ORDER BY le.period ASC
        ";
        $stmt = $pdo->query($sqlExpByPeriod);
        $expenseByPeriod = $stmt->fetchAll();

        // ===================================================
        // 4. Expense by category (breakdown)
        // ===================================================
        $sqlExpByCat = "
            SELECT
                c.name  AS category_name,
                c.type  AS category_type,
                c.color AS category_color,
                COALESCE(SUM(le.actual), 0) AS total_actual
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
            WHERE c.type IN ('cogs', 'opex', 'capex')
        ";
        $paramsExpByCat = [];

        if ($period) {
            $sqlExpByCat .= " AND le.period = :period";
            $paramsExpByCat[':period'] = $period;
        }

        $sqlExpByCat .= " GROUP BY c.id, c.name, c.type, c.color ORDER BY c.sort_order";

        $stmt = $pdo->prepare($sqlExpByCat);
        $stmt->execute($paramsExpByCat);
        $expenseByCategory = $stmt->fetchAll();

        // ===================================================
        // 5. Revenue by subcategory (breakdown by account subcategory)
        // ===================================================
        $sqlRevBySub = "
            SELECT
                COALESCE(a.subcategory, 'Khac') AS subcategory,
                COALESCE(SUM(le.actual), 0) AS total_actual
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
            WHERE c.type = 'revenue'
        ";
        $paramsRevBySub = [];

        if ($period) {
            $sqlRevBySub .= " AND le.period = :period";
            $paramsRevBySub[':period'] = $period;
        }

        $sqlRevBySub .= " GROUP BY a.subcategory ORDER BY total_actual DESC";

        $stmt = $pdo->prepare($sqlRevBySub);
        $stmt->execute($paramsRevBySub);
        $revenueBySubcategory = $stmt->fetchAll();

        // ===================================================
        // 6. Monthly trend (per-period: revenue, cogs, opex, net)
        // ===================================================
        $sqlTrend = "
            SELECT
                le.period,
                COALESCE(SUM(CASE WHEN c.type = 'revenue' THEN le.actual ELSE 0 END), 0) AS revenue,
                COALESCE(SUM(CASE WHEN c.type = 'cogs'    THEN le.actual ELSE 0 END), 0) AS cogs,
                COALESCE(SUM(CASE WHEN c.type = 'opex'    THEN le.actual ELSE 0 END), 0) AS opex,
                COALESCE(
                    SUM(CASE WHEN c.type = 'revenue' THEN le.actual ELSE 0 END)
                    - SUM(CASE WHEN c.type = 'cogs' THEN le.actual ELSE 0 END)
                    - SUM(CASE WHEN c.type = 'opex' THEN le.actual ELSE 0 END),
                    0
                ) AS net
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
            GROUP BY le.period
            ORDER BY le.period ASC
        ";
        $stmt = $pdo->query($sqlTrend);
        $monthlyTrend = $stmt->fetchAll();

        // ===================================================
        // Transform arrays to match frontend TypeScript types
        // (MySQL PDO returns strings; Recharts needs numbers)
        // ===================================================
        $revenueByPeriodMapped = array_map(fn($r) => [
            'period' => $r['period'],
            'amount' => (float) $r['total_revenue'],
        ], $revenueByPeriod);

        $expenseByPeriodMapped = array_map(fn($r) => [
            'period' => $r['period'],
            'amount' => (float) $r['total_expense'],
        ], $expenseByPeriod);

        $expenseByCategoryMapped = array_map(fn($r) => [
            'name'   => $r['category_name'],
            'amount' => (float) $r['total_actual'],
            'color'  => $r['category_color'] ?? '#94A3B8',
        ], $expenseByCategory);

        $revenueBySubcategoryMapped = array_map(fn($r) => [
            'name'   => $r['subcategory'],
            'amount' => (float) $r['total_actual'],
        ], $revenueBySubcategory);

        $monthlyTrendMapped = array_map(fn($r) => [
            'period'  => $r['period'],
            'revenue' => (float) $r['revenue'],
            'cogs'    => (float) $r['cogs'],
            'opex'    => (float) $r['opex'],
            'net'     => (float) $r['net'],
        ], $monthlyTrend);

        // ===================================================
        // Assemble response
        // ===================================================
        $summary = [
            'period'         => $period ?? 'all',

            // Top-level totals (already float from casting above)
            'total_revenue'  => $totals['total_revenue'],
            'total_cogs'     => $totals['total_cogs'],
            'total_opex'     => $totals['total_opex'],
            'total_capex'    => $totals['total_capex'],
            'net_profit'     => $netProfit,
            'burn_rate'      => $burnRate,

            // Budget comparisons
            'budget_revenue' => $budgets['budget_revenue'],
            'budget_cogs'    => $budgets['budget_cogs'],
            'budget_opex'    => $budgets['budget_opex'],
            'budget_capex'   => $budgets['budget_capex'],

            // Breakdowns (mapped to match frontend types)
            'revenue_by_period'      => $revenueByPeriodMapped,
            'expense_by_period'      => $expenseByPeriodMapped,
            'expense_by_category'    => $expenseByCategoryMapped,
            'revenue_by_subcategory' => $revenueBySubcategoryMapped,
            'monthly_trend'          => $monthlyTrendMapped,
        ];

        jsonResponse($summary);
        break;

    // -------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------
    default:
        errorResponse('Method not allowed. Summary endpoint supports GET only.', 405);
}
