export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      // TODO: verify token with JWT or other logic
      req.user = { id: '123', name: 'Test User' }; // mock
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
  