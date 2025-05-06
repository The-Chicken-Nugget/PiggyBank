require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// middleware
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, User, Account, Transaction } = require('./models');
const jwt = require('jsonwebtoken');

app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// helper: hash + verify
const bcrypt = require('bcryptjs');
async function hashPass(pw) { return bcrypt.hash(pw, 10); }
async function checkPass(pw, h) { return bcrypt.compare(pw, h); }

// auth middleware
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  try {
    req.uid = jwt.verify(token, JWT_SECRET).uid;
    next();
  } catch {
    res.sendStatus(401);
  }
}

// helper to find account owned by user and open
async function findOwnAccount(uid, id) {
  const acc = await Account.findOne({ where: { id, userId: uid, closedAt: null } });
  if (!acc) throw new Error('not_found');
  return acc;
}

// routes
app.get('/api/ping', (_req, res) => res.json({ pong: true }));

// register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ error: 'email_in_use' });
  const user = await User.create({
    name,
    email,
    passwordHash: await hashPass(password)
  });
  res.json({ id: user.id, email: user.email });
});

// login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await checkPass(password, user.passwordHash)))
    return res.status(401).json({ error: 'bad_creds' });
  const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '15m' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' }).json({ ok: true });
});

// logout
app.post('/api/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' }).json({ ok: true });
});

// get current user (test)
app.get('/api/me', auth, async (req, res) => {
  res.json({ ok: true, uid: req.uid });
});

// list accounts
app.get('/api/accounts', auth, async (req, res) => {
  const accts = await Account.findAll({ where: { userId: req.uid } });
  res.json(accts);
});

// create account
app.post('/api/accounts', auth, async (req, res) => {
  const { accountType } = req.body;
  const acc = await Account.create({
    userId: req.uid,
    accountType,
    accountNumber: Math.random().toString().slice(2, 10)
  });
  res.status(201).json(acc);
});

//Rename account
app.patch('/api/accounts/:id', auth, async (req, res) => {
  try {
    // make sure it’s one of the user’s accounts
    const acct = await findOwnAccount(req.uid, req.params.id);
    // trim & cap at 40 chars; allow clearing the nickname with empty string
    acct.nickname = req.body.nickname?.trim().slice(0, 40) || null;
    await acct.save();
    res.json(acct);
  } catch (e) {
    // if they tried to touch someone else’s account, send a 404 or 403
    return res.status( e.message === 'not_found' ? 404 : 400 ).json({ error: e.message });
  }
});

// deposit
app.post('/api/accounts/:id/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'missing' });
  if (amount <= 0) return res.status(400).json({ error: 'bad_amount' });
  const acc = await findOwnAccount(req.uid, req.params.id);
  await acc.deposit(amount, { description: req.body.description });
  res.json({ ok: true });
});

// withdraw
app.post('/api/accounts/:id/withdraw', auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'missing' });
  if (amount <= 0) return res.status(400).json({ error: 'bad_amount' });
  try {
    const acc = await findOwnAccount(req.uid, req.params.id);
    await acc.withdraw(amount, { description: req.body.description });
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'insufficient') return res.status(400).json({ error: 'insufficient' });
    throw e;
  }
});

// list transactions
app.get('/api/accounts/:id/transactions', auth, async (req, res) => {
  const tx = await Transaction.findAll({
    where: { accountId: req.params.id },
    order: [['createdAt', 'DESC']]
  });
  res.json(tx);
});

// transfer
app.post('/api/accounts/:id/transfer', auth, async (req, res) => {
  const { toAccountNumber, amount, memo } = req.body;
  if (!toAccountNumber || !amount) return res.status(400).json({ error: 'missing' });
  if (amount <= 0) return res.status(400).json({ error: 'bad_amount' });
  try {
    const src = await findOwnAccount(req.uid, req.params.id);
    const dest = await Account.findOne({ where: { accountNumber: toAccountNumber, closedAt: null } });
    if (!dest) return res.status(404).json({ error: 'dest_not_found' });
    if (src.id === dest.id) return res.status(400).json({ error: 'same_account' });
    await src.transferTo(dest, amount, memo);
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'insufficient') return res.status(400).json({ error: 'insufficient' });
    if (e.message === 'not_found') return res.status(404).end();
    throw e;
  }
});

// bill pay
app.post('/api/accounts/:id/paybill', auth, async (req, res) => {
  const { payee, amount, memo } = req.body;
  if (!payee || !amount) return res.status(400).json({ error: 'missing' });
  if (amount <= 0) return res.status(400).json({ error: 'bad_amount' });
  try {
    const src = await findOwnAccount(req.uid, req.params.id);

    //Does payee exist?
    const dest = await Account.findOne({ 
      where: { accountNumber: payee, closedAt: null }
    });

    await sequelize.transaction(async (t) => {
      // Source side (negative)
      await Transaction.create({
        accountId: src.id,
        targetAccountId: dest.id ?? null,
        type: dest ? 'BILL_PAY_OUT' : 'BILL_PAY',
        amount: -amount,
        description: memo ?? `Bill pay to ${payee}`
      }, { transaction: t });
      // Update source account balance
      src.balance -= amount;
      await src.save({ transaction: t });

      // Destination side (positive)
      if (dest) {
        await Transaction.create({
          accountId: dest.id,
          targetAccountId: src.id,
          type: 'BILL_PAY_IN',
          amount: amount,
          description: `From account ${src.accountNumber}: ${memo ?? ''}`.trim(),
        }, { transaction: t });
        // Update destination account balance
        dest.balance += amount;
        await dest.save({ transaction: t });
      }

    });
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'insufficient') return res.status(400).json({ error: 'insufficient' });
    throw e;
  }
});

// close account
app.post('/api/accounts/:id/close', auth, async (req, res) => {
  const acc = await findOwnAccount(req.uid, req.params.id);
  if (acc.balance !== 0) return res.status(400).json({ error: 'non_zero_balance' });
  acc.closedAt = new Date();
  await acc.save();
  res.json({ ok: true });
});

// start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`API listening on ${PORT}`)
  );
}

module.exports = app;
