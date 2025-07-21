import '../models/role.model.js';
import userRepository from '../respositories/userRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import { sendResetPasswordEmail,sendLoginDetailsEmail,sendVerificationEmail } from '../respositories/emailRepository.js';



export const createUser = async (req, res) => {
  const { name, email, role, phone } = req.body;
  let { password } = req.body;
  
  try {

    let isPasswordGenerated = false;
    if (!password) {
      password = crypto.randomBytes(8).toString('hex'); 
      isPasswordGenerated = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [error, user] = await userRepository.insertOne({
      name,
      email,
      password: hashedPassword,
      role: role ? role : "686627e931d307ca807aba18",
      emailVerified: isPasswordGenerated, // Auto-verify if password was generated
      phone:phone,
    });

    if (error) {
      return res.status(500).json({ message: "Failed to create user" });
    }

   
    if (isPasswordGenerated) {
      try {
        await sendLoginDetailsEmail(email, name, email, password);
      } catch (emailError) {
        console.error('Failed to send login details email:', emailError);
      }
    } else {
      try {
      
        const verificationToken = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            type: 'email_verification'
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        await sendVerificationEmail(email, name, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
    }

    // Don't return the password in response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(201).json({ 
      message: isPasswordGenerated 
        ? "User created successfully. Login details sent to email." 
        : "User created successfully. Please check your email to verify your account.",
      user: userResponse,
      passwordGenerated: isPasswordGenerated,
      emailVerificationRequired: !isPasswordGenerated
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const [error, user] = await userRepository.findOneById(decoded.userId);

    if (error || !user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.email !== decoded.email) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const [updateError, updatedUser] = await userRepository.findOneAndUpdate(
      { _id: user._id },
      { emailVerified: true }
    );

    if (updateError || !updatedUser) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    res.json({ message: "Email verified successfully. You can now login." });

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: "Invalid verification token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Verification token has expired" });
    }
    console.error('Error verifying email:', err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  
  try {
    const [error, user] = await userRepository.findOne({ email });

    if (error || !user) {
      return "User not found";
    }

    if (user.emailVerified) {
      return({ message: "Email is already verified" });
    }

   
    const verificationToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        type: 'email_verification'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    try {
      await sendVerificationEmail(email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return({ message: "Failed to send verification email" });
    }

    return({ message: "Verification email sent successfully" });

  } catch (err) {
    console.error('Error resending verification email:', err);
    return({ message: "Something went wrong" });
  }
};




export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [error, user] = await userRepository.findOne({ email });
    console.log(error,user);
    if (error || !user) return res.status(400).json({ message: "User not found" });

    if (!user.isActive) {
      return res.status(400).json({message: "Account deactivated. Contact support for help."});
    }

    if (!user.emailVerified) {
      await resendVerificationEmail(email);
      return res.status(400).json({
        message: "Please verify your email",
        emailVerificationRequired: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong credentials" });

    await user.populate('role');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    // 👉 Set JWT in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ message: "Login success" ,user,token});
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//forgot password

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {

    const [error, user] = await userRepository.findOne({ email });

    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }


    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    await sendResetPasswordEmail(user.email, resetToken, user.name);



    const [updateError, updatedUser] = await userRepository.findOneAndUpdate(
      { _id: user._id },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      }
    );

    if (updateError || !updatedUser) {
      return res.status(500).json({ message: "Something went wrong" });
    }



    res.json({
      message: 'password. reset email sent',

      resetToken: resetToken
    });

  } catch (err) {
    res.status(500).json({ message: 'error' });
  }
};

export const resetPassword = async (req, res) => {
  const { newPassword,token } = req.body;
 // const {token} = req.query;

  try {

    const [error, user] = await userRepository.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (error || !user) {
      return res.status(400).json({ message: "token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);


    const [updateError, updatedUser] = await userRepository.findOneAndUpdate(
      { _id: user._id },
      {
        password: hashedPassword,
        resetPasswordToken: '',
        resetPasswordExpires: '',
      }
    );
   
    if (updateError || !updatedUser) {
      return res.status(500).json({ message: "something went wrong" });
    }

    res.json({ message: "password reset successfully" });

  } catch (err) {
    res.status(500).json({ message: err });
  }
};