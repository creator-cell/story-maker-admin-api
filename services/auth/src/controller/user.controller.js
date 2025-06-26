import userRepository from '../respositories/userRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import i18n from '../i18n/index.js'; // Same format as your validation

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

    if (error) {
      return res.status(500).json({ message: i18n.__('error.generic') });
    }

    res.status(201).json({ message: i18n.__('user.created'), user });
  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user, error] = await userRepository.findOne({ email });

    if (error || !user) {
      return res.status(400).json({ message: i18n.__('auth.invalid_credentials') });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: i18n.__('auth.invalid_credentials') });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: i18n.__('auth.login_success'), token });
  } catch (err) {
    res.status(500).json({ message: i18n.__('error.generic') });
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
