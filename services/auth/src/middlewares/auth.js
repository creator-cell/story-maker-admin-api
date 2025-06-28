// export const authMiddleware = (req, res, next) => {
//     const token = req.headers.authorization?.split(' ')[1];
  
//     if (!token) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
  
//     try {
//       // TODO: verify token with JWT or other logic
//       req.user = { id: '123', name: 'Test User' }; // mock
//       next();
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//   };
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';
const authMiddleware = async(req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details including role from database
    const user = await User.findById(decoded.userId);
    console.log("user",user);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    
    req.user = {
      userId: decoded.userId,
      role: user.role,
      ...decoded
    };
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
