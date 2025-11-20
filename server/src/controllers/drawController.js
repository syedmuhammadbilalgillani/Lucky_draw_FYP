import { prisma } from '../config/db.js';
import logger from '../lib/logger.js';
import { sendWinnerEmail, sendDrawCompletionEmail } from '../helpers/emailService.js';


// ===================== Public APIs =====================

// List all draws with filters (status, upcoming, completed)
export const getDraws = async (req, res) => {
  const { status, upcoming, completed } = req.query;

  try {
    const where = {};
    if (status) where.status = status;
    if (upcoming) where.startDateTime = { gt: new Date() };
    if (completed) where.status = 'COMPLETED';

    const draws = await prisma.luckyDraw.findMany({
      where,
    });

    res.json(draws);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
};

// Get details of a specific draw (info, prizes, schedule)
export const getDrawDetail = async (req, res) => {
  const { id } = req.params;
  logger.info("GET /api/draws/:id", id);
  try {
    const draw = await prisma.luckyDraw.findUnique({
      where: { id: parseInt(id) },
      include: {
        prizes: true,
        entries: true,
      },
    });

    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    res.json(draw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch draw details' });
  }
};

// Check if the current user joined the draw
export const checkUserEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming `req.user` is populated after authentication

  try {
    const entry = await prisma.participantEntry.findUnique({
      where: {
        drawId_userId: {
          drawId: parseInt(id),
          userId,
        },
      },
    });

    if (!entry) return res.status(404).json({ error: 'No entry found' });

    res.json({ entryStatus: entry.isValid ? 'VALID' : 'INVALID', ticketNumber: entry.ticketNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check entry' });
  }
};

// Create participant entry (join draw)
export const createEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const draw = await prisma.luckyDraw.findUnique({
      where: { id: parseInt(id) },
    });

    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    if (draw.status !== 'OPEN') {
      return res.status(400).json({ error: 'Draw is not open for entries' });
    }

    // Check if user already entered
    const existingEntry = await prisma.participantEntry.findUnique({
      where: {
        drawId_userId: {
          drawId: parseInt(id),
          userId,
        },
      },
    });

    if (existingEntry) {
      return res.status(409).json({ error: 'You have already entered this draw' });
    }

    // Generate ticket number
    const ticketNumber = `TKT-${draw.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const entry = await prisma.participantEntry.create({
      data: {
        drawId: parseInt(id),
        userId,
        ticketNumber,
        isValid: true,
      },
    });

    res.json({
      id: entry.id,
      ticketNumber: entry.ticketNumber,
      entryTime: entry.entryTime,
      message: 'Successfully joined the draw',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

// Get public list of winners for a specific draw (after completion)
export const getDrawWinners = async (req, res) => {
  const { id } = req.params;

  try {
    const winners = await prisma.winner.findMany({
      where: { 
        entry: {
          drawId: parseInt(id)
        }
      },
      include: { 
        prize: true, 
        entry: {
          include: {
            user: true
          }
        }
      },
    });

    res.json(winners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
};

// ===================== Admin APIs =====================

// Create a new lucky draw
export const createDraw = async (req, res) => {
  logger.info("POST /api/draws/c", req.body);
  const { title, description, drawType, startDateTime, endDateTime, maxWinners, eligibilityCriteria } = req.body;

  try {
    const draw = await prisma.luckyDraw.create({
      data: {
        title,
        description,
        drawType,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        maxWinners,
        eligibilityCriteria,
        status: 'DRAFT',
        createdById: req.user.id, // Admin user
      },
    });

    res.json(draw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create draw' });
  }
};

// Update draw details
export const updateDraw = async (req, res) => {
  const { id } = req.params;
  const { title, description, maxWinners, eligibilityCriteria } = req.body;

  try {
    const draw = await prisma.luckyDraw.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        maxWinners,
        eligibilityCriteria,
      },
    });

    res.json(draw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update draw' });
  }
};

// Change draw status (DRAFT → OPEN → CLOSED → COMPLETED)
export const changeDrawStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const draw = await prisma.luckyDraw.update({
      where: { id: parseInt(id) },
      data: {
        status,
      },
    });

    res.json(draw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change draw status' });
  }
};

// Delete (cancel/remove) a draw
export const deleteDraw = async (req, res) => {
  const { id } = req.params;

  try {
    const draw = await prisma.luckyDraw.delete({
      where: { id: parseInt(id) },
    });

    res.json(draw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete draw' });
  }
};

// List all participants for a draw
export const getDrawParticipants = async (req, res) => {
  const { id } = req.params;

  try {
    const participants = await prisma.participantEntry.findMany({
      where: { drawId: parseInt(id) },
      include: { user: true },
    });

    res.json(participants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

// Admin: Create participant entry for a specific user
export const createParticipantEntry = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const draw = await prisma.luckyDraw.findUnique({
      where: { id: parseInt(id) },
    });

    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already entered
    const existingEntry = await prisma.participantEntry.findUnique({
      where: {
        drawId_userId: {
          drawId: parseInt(id),
          userId: parseInt(userId),
        },
      },
    });

    if (existingEntry) {
      return res.status(409).json({ error: 'User has already entered this draw' });
    }

    // Generate ticket number
    const ticketNumber = `TKT-${draw.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const entry = await prisma.participantEntry.create({
      data: {
        drawId: parseInt(id),
        userId: parseInt(userId),
        ticketNumber,
        isValid: true,
      },
      include: { user: true },
    });

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create participant entry' });
  }
};

// Trigger random winner selection
export const runDraw = async (req, res) => {
  const { id } = req.params;

  try {
    const draw = await prisma.luckyDraw.findUnique({
      where: { id: parseInt(id) },
      include: { 
        entries: {
          include: { user: true }
        }, 
        prizes: true 
      },
    });

    if (!draw || draw.status !== 'OPEN') {
      return res.status(400).json({ error: 'Draw must be open to run' });
    }

    // Filter only valid entries
    const validEntries = draw.entries.filter(entry => entry.isValid);
    
    if (validEntries.length === 0) {
      return res.status(400).json({ error: 'No valid entries found for this draw' });
    }

    if (draw.prizes.length === 0) {
      return res.status(400).json({ error: 'No prizes configured for this draw' });
    }

    // Randomly select winners from valid entries
    const winners = [];
    const shuffledEntries = validEntries.sort(() => 0.5 - Math.random()).slice(0, draw.maxWinners);

    for (let i = 0; i < shuffledEntries.length; i++) {
      const entry = shuffledEntries[i];
      const prize = draw.prizes[i % draw.prizes.length];
      
      const winner = await prisma.winner.create({
        data: {
          entryId: entry.id,
          prizeId: prize.id,
        },
        include: {
          entry: {
            include: { user: true }
          },
          prize: true
        },
      });
      winners.push(winner);

      // Send email notification to winner
      try {
        await sendWinnerEmail(
          entry.user,
          draw,
          prize,
          entry.ticketNumber
        );

        // Create notification record
        await prisma.notification.create({
          data: {
            userId: entry.user.id,
            drawId: draw.id,
            type: 'WIN_RESULT',
            channel: 'EMAIL',
            messageBody: `Congratulations! You won ${prize.prizeName} in ${draw.title}`,
            sentAt: new Date(),
          },
        });
      } catch (emailError) {
        logger.error(`Failed to send email to winner ${entry.user.email}:`, emailError);
        // Continue even if email fails
      }
    }

    // Update the draw status to completed and set draw date
    await prisma.luckyDraw.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'COMPLETED',
        drawDateTime: new Date(),
      },
    });

    // Send completion notifications to all participants (optional, can be done in background)
    // This notifies everyone that the draw is complete
    const allParticipants = draw.entries.map(e => e.user);
    const uniqueParticipants = Array.from(
      new Map(allParticipants.map(u => [u.id, u])).values()
    );

    // Send completion emails in background (don't wait)
    Promise.all(
      uniqueParticipants.map(user => 
        sendDrawCompletionEmail(user, draw).catch(err => 
          logger.error(`Failed to send completion email to ${user.email}:`, err)
        )
      )
    ).catch(err => logger.error('Error sending completion emails:', err));

    res.json(winners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to run draw' });
  }
};

// ===================== Prize APIs =====================

// List prizes for a draw
export const getPrizes = async (req, res) => {
  const { id } = req.params;

  try {
    const prizes = await prisma.prize.findMany({
      where: { drawId: parseInt(id) },
    });

    res.json(prizes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prizes' });
  }
};

// Create a prize for a draw
export const createPrize = async (req, res) => {
  const { id } = req.params;
  const { prizeName, prizeDescription, quantity, prizeRank } = req.body;

  try {
    const prize = await prisma.prize.create({
      data: {
        drawId: parseInt(id),
        prizeName,
        prizeDescription,
        quantity,
        prizeRank,
      },
    });

    res.json(prize);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create prize' });
  }
};

// Update prize details
export const updatePrize = async (req, res) => {
  const { prizeId } = req.params;
  const { prizeName, prizeDescription, quantity, prizeRank } = req.body;

  try {
    const prize = await prisma.prize.update({
      where: { id: parseInt(prizeId) },
      data: { prizeName, prizeDescription, quantity, prizeRank },
    });

    res.json(prize);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update prize' });
  }
};

// Remove prize
export const deletePrize = async (req, res) => {
  const { prizeId } = req.params;

  try {
    const prize = await prisma.prize.delete({
      where: { id: parseInt(prizeId) },
    });

    res.json(prize);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete prize' });
  }
};
