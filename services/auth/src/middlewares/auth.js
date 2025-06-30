import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user and populate role dynamically from database
    const user = await User.findById(decoded.userId).populate('role', 'name');
   
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    
    req.user = {
      userId: decoded.userId,
      role: user.role?.name, // Dynamic role name from Role collection
      roleId: user.role?._id,
      ...decoded
    };
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
