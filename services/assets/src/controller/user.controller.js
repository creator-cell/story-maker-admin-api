import userRepository from '../respositories/userRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import {sendLoginDetailsEmail,sendVerificationEmail } from '../respositories/emailRepository.js';
import mongoose from 'mongoose';

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
      role: role?role:"686627e931d307ca807aba18",
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

export const getAllUser = async (req, res) => {
  const { 
    page = 1, 
    pageSize = 10, 
    search, 
    name, 
    email, 
    phoneNumber,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  const filters = {};
  if (name) filters.name = name;
  if (email) filters.email = email;
  if (phoneNumber) filters.phoneNumber = phoneNumber;

  let baseFilter = {};

  if (req?.user?.userId && mongoose.isValidObjectId(req?.user?.userId)) {
      baseFilter = {_id: {$ne: new mongoose.Types.ObjectId(req.user?.userId)}};
  }

  const result = await userRepository.getManyWithPagination(baseFilter, {
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    search,
    filters,
    sort
  });

  if (result.error) {
    return res.status(500).json({ message: 'Error fetching users', error: result.error });
  }

  res.json(result.data);
};


// Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [error, user] = await userRepository.findOneById(id, { password: 0 });
    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.populate('role');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
console.log("updateData",updateData);
  try {
    const [error, user] = await userRepository.findOneAndUpdate({ _id: id }, updateData);
    if (error || !user) {
      return res.status(400).json({ message: "user update_failed" });
    }

    res.json({ message: "user updated", user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [ error,result] = await userRepository.deleteOne({ _id: id });
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: "failed to delete user" });
    }

    res.json({ message: "user deleted" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const userActiveToggle = async (req, res) => {
  const { id } = req.params;

  try {
    if (req?.user?.userId == id) {
      return res.status(400).json({
        status: "fail",
        statusCode: 400,
        message: "Invalid request.",
        data: {}
      });
    }
    const [error, user] = await userRepository.findOneById(id, {password: 0});
    if (!user) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: "User not found.",
        data: {}
      });
    }
    console.log(user);
    await userRepository.updateOne({ _id:id }, { isActive: !user?.isActive });
    res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Active status has been updated.",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update the user active status."
    });
  }
};