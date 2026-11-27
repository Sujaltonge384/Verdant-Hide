// server/src/routes/supportRoutes.js
const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createTicket, getAllTickets, updateTicket } = require('../controllers/supportController');

const ticketSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  orderNumber: z.string().optional(),
  topic: z.string().optional(),
  message: z.string().min(10, 'Please enter at least 10 characters'),
});

router.post('/', validate(ticketSchema), createTicket);
router.get('/', protect, adminOnly, getAllTickets);
router.patch('/:id', protect, adminOnly, updateTicket);

module.exports = router;