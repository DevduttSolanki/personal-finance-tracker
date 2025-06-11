const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer'); //for sending the email and create a temporary verification system.
const app = express();


app.use(cors()); // 👈 Allow frontend to access backend
app.use(bodyparser.json()); // 👈 Parse incoming JSON data
app.use(express.static(path.join(__dirname,'../frontend')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../frontend/login.html'));
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/personal-finance-trackerDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('MongoDB connected ✅');
}).catch(err => console.log('MongoDB connection error:', err));

// users Schema & Model
// const usersSchema = new mongoose.Schema({
//     fullname: String,
//     email: String,
//     password: String,
//     isVerified: { type: Boolean, default: false }
// });
const usersSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  profileImage: { type: String, default: '' },
  isVerified: { type: Boolean, default: false }
});


// Profile API ------------------------------------------------------------------------------------- 

app.get('/api/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id, '-password'); // exclude password
  res.json(user);
});

app.put('/api/user/image/:id', async (req, res) => {
  const { profileImage } = req.body;
  await User.findByIdAndUpdate(req.params.id, { profileImage });
  res.json({ message: 'Profile image updated' });
});

// Password Reset Email (Simulated)
app.post('/api/password-reset', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'Email not found' });

  const token = encodeURIComponent(Buffer.from(email).toString('base64'));
  const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;

  const mailOptions = {
    from: '18devdutt@gmail.com',
    to: email,
    subject: 'Password Reset - Personal Finance Tracker',
    html: `<p>Click here to reset your password: <a href="${resetLink}">Reset Password</a></p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).json({ message: 'Error sending email' });
    res.json({ message: 'Password reset link sent to email ✅' });
  });
});


// Profile API ------------------------------------------------------------------------------------- END


// Password Reset API ------------------------------------------------------------------------------------- 

// API: Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
  }
  
  try {
      // Decode token to get email
      const email = Buffer.from(decodeURIComponent(token), 'base64').toString('utf-8');
      
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.json({ message: 'Password reset successful ✅' });
  } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Password Reset API ------------------------------------------------------------------------------------- END 

const User = mongoose.model('User',usersSchema,'users');

// EMAIL VERIFICATION and REGISTER USER-----------------------------------------------------------

// Transporter setup (Use your Gmail or test SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '18devdutt@gmail.com', // <-- Replace
        pass: 'xeid suwi npmf jfen'      // <-- Use app password if 2FA is on
    }
});

// API: Check Email & Send Verification Link
app.post('/api/send-verification', async (req, res) => {
    const { fullname, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a simple verification token (in real apps, use JWT or UUID)
    const token = encodeURIComponent(Buffer.from(email).toString('base64'));

    // Send email
    const link = `http://localhost:3000/api/verify-email?token=${token}&fullname=${fullname}&password=${password}`;
    const mailOptions = {
        from: '18devdutt@gmail.com',
        to: email,
        subject: 'Email Verification - Personal Finance Tracker',
        html: `<p>Hello ${fullname},</p><p>Click the link to verify your email: 
               <a href="${link}">Verify Email</a></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email Error:', error);
            return res.status(500).json({ message: 'Error sending email' });
        }
        res.json({ message: 'Verification email sent' });
    });
});

// API: Verify email and register user
app.get('/api/verify-email', async (req, res) => {
    const { token, fullname, password } = req.query;
    const email = Buffer.from(decodeURIComponent(token), 'base64').toString('utf-8');

    const newUser = new User({ fullname, email, password, isVerified: true });
    await newUser.save();

    res.send(`<h1>Email verified and user registered successfully ✅</h1>
              <a href="/">Go to Registration Page</a>`);
});

// EMAIL VERIFICATION and REGISTER USER----------------------------------------------------------- END

// //Register API
// app.post('/api/users',async(req,res)=>{
//     const user = new User(req.body);
//     await user.save();
//     res.json({message: 'User Registered'})
// });

// LOGIN API ------------------------------------------------------------------------------------- 

// LOGIN API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Check user by email
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    if (user.password !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    // Check if email is verified
    if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Success
    res.json({ message: `Welcome, ${user.fullname}!`, userId: user._id }); // ✅ include userId
});


// LOGIN API ------------------------------------------------------------------------------------- END

// Income Management APIs ------------------------------------------------------------------------------------- 

// Income Schema
const incomeSchema = new mongoose.Schema({
  userId: String, // 👈 NEW
  source: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

  
  const Income = mongoose.model('Income', incomeSchema, 'incomes');
  
  // Create Income
  app.post('/api/income', async (req, res) => {
    const income = new Income(req.body);
    await income.save();
    res.json({ message: 'Income added' });
  });
  
  // Get All Income
  app.get('/api/income', async (req, res) => {
    const userId = req.query.userId; // 👈 get userId from query param
    const data = await Income.find({ userId });
    res.json(data);
  });
  
  // Update Income
  app.put('/api/income/:id', async (req, res) => {
    await Income.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Income updated' });
  });
  
  // Delete Income
  app.delete('/api/income/:id', async (req, res) => {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income deleted' });
  });
  
// Income Management APIs ------------------------------------------------------------------------------------- END

// Expense Management APIs ------------------------------------------------------------------------------------- 

// Expense Schema
const expenseSchema = new mongoose.Schema({
  userId: String, // 👈 NEW
  category: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

  const Expense = mongoose.model('Expense', expenseSchema, 'expenses');
  
  // Add Expense
  app.post('/api/expense', async (req, res) => {
    const expense = new Expense(req.body);
    await expense.save();
    res.json({ message: 'Expense added' });
  });
  
  // Get All Expenses
  app.get('/api/expense', async (req, res) => {
    const userId = req.query.userId; // 👈 get userId from query param
    const data = await Expense.find({ userId });
    res.json(data);
  });
  
  // Update Expense
  app.put('/api/expense/:id', async (req, res) => {
    await Expense.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Expense updated' });
  });
  
  // Delete Expense
  app.delete('/api/expense/:id', async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  });
  
// Expense Management APIs ------------------------------------------------------------------------------------- END

// Budget APIs ------------------------------------------------------------------------------------- 

// Budget Schema
const budgetSchema = new mongoose.Schema({
  userId: String, // 👈 NEW
  amount: Number
}, { collection: 'budget' });

const Budget = mongoose.model('Budget', budgetSchema);

// Save or Update Monthly Budget
app.post('/api/budget', async (req, res) => {
  const { userId, amount } = req.body;
  const existing = await Budget.findOne({ userId });
  if (existing) {
    existing.amount = amount;
    await existing.save();
  } else {
    await Budget.create({ userId, amount });
  }
  res.json({ message: 'Budget saved' });
});

// Get Budget
app.get('/api/budget', async (req, res) => {
  const userId = req.query.userId;
  const data = await Budget.findOne({ userId });
  res.json(data || {});
});

// Budget APIs ------------------------------------------------------------------------------------- END

const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
});