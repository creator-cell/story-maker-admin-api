import User from "../models/user.model.js";
import Role from "../models/role.model.js"; // Make sure to import Role model
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    const user = await User.findById(decoded.userId).populate('role');
   
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (!user.role) {
      return res.status(401).json({ message: 'User role not assigned.' });
    }

    // Add debug logging
    console.log('Auth Debug - User:', {
      userId: user._id,
      email: user.email,
      roleId: user.role._id,
      roleName: user.role.name
    });
    
    req.user = {
      userId: decoded.userId,
      role: user.role.name,
      roleId: user.role._id,
      rolePermissions: {
        read: user.role.read,
        write: user.role.write,
        both: user.role.both,
        menu: user.role.menu
      },
      ...decoded
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
