/**
 * GradGrid — Finance Module
 *
 * Fee structures, invoice generation, payment tracking, and financial reporting.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// GET /api/v1/finance/fee-structures — list fee structures
// POST /api/v1/finance/fee-structures — create fee structure
// PUT /api/v1/finance/fee-structures/:id — update fee structure

// GET /api/v1/finance/invoices — list invoices
// POST /api/v1/finance/invoices — generate invoice
// GET /api/v1/finance/invoices/:id — get invoice details
// PUT /api/v1/finance/invoices/:id — update invoice

// POST /api/v1/finance/payments — record payment
// GET /api/v1/finance/payments — list payments
// GET /api/v1/finance/transactions — list all transactions
// GET /api/v1/finance/summary — financial summary

export default router;
