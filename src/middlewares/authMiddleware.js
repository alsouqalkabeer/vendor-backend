import jwt from 'jsonwebtoken';

const authMiddleware = {
  verifyToken: (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided'
        });
      }
      
      // Extract token
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Attach user to request
      req.user = decoded;
      
      // Continue to next middleware or controller
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }
};

export default authMiddleware;