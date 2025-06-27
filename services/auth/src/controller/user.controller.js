import userRepository from '../respositories/userRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import i18n from '../i18n/index.js'; // Same format as your validation
import crypto from 'crypto';
// Create User
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user, error] = await userRepository.insertOne({
      name,
      email,
      password: hashedPassword,
    });

   
    res.status(201).json({ message: user });
  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
 
 
  try {
    const [error, user] = await userRepository.findOne({email});
   
    if (error || !user) {
      return res.status(400).json({ message: "wrong email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "wrong credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: "login success", token });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [user, error] = await userRepository.findOneById(id, { password: 0 });
    if (error || !user) {
      return res.status(404).json({ message: i18n.__('user.not_found') });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const [user, error] = await userRepository.findOneAndUpdate({ _id: id }, updateData);
    if (error || !user) {
      return res.status(400).json({ message: i18n.__('user.update_failed') });
    }

    res.json({ message: i18n.__('user.updated'), user });
  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result, error] = await userRepository.deleteOne({ _id: id });
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: i18n.__('user.delete_failed') });
    }

    res.json({ message: i18n.__('user.deleted') });
  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
  }
};

//forgot password

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    
    const [error, user] = await userRepository.findOne({ email });
    
    if (error || !user) {
      return res.status(404).json({ message: i18n.__('user.not_found') });
    }

    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

   
    const [updateError, updatedUser] = await userRepository.findOneAndUpdate(
      { _id: user._id },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      }
    );

    if (updateError || !updatedUser) {
      return res.status(500).json({ message: i18n.__('error.generic') });
    }

    
    
    res.json({ 
      message: 'password.reset_email_sent',
     
      resetToken: resetToken 
    });

  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

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
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      }
    );

    if (updateError || !updatedUser) {
      return res.status(500).json({ message: "something went wrong"});
    }

    res.json({ message: "password reset successfully" });

  } catch (err) {
    res.status(500).json({ message: err });
  }
};

