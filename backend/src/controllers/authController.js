const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      store_id: user.store_id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      roleName: user.role_name,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Helper to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Fetch user and join with roles & stores
    const queryStr = `
      SELECT u.*, r.name as role_name, r.permissions, s.name as store_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN stores s ON u.store_id = s.id
      WHERE u.username = $1
    `;
    const userRes = await db.query(queryStr, [username]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'User account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send password hash in response
    delete user.password_hash;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          storeId: user.store_id,
          storeName: user.store_name || 'All Stores (Global)',
          username: user.username,
          email: user.email,
          roleId: user.role_id,
          roleName: user.role_name,
          permissions: user.permissions,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.refresh = async (req, res) => {
  // Get refresh token from cookie or body/headers
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Fetch latest user details and permissions
    const queryStr = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const userRes = await db.query(queryStr, [decoded.id]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'User account is deactivated' });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    console.error('Refresh token verification failed:', err);
    return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const queryStr = `
      SELECT u.id, u.username, u.email, u.store_id, u.role_id, r.name as role_name, r.permissions, s.name as store_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN stores s ON u.store_id = s.id
      WHERE u.id = $1
    `;
    const userRes = await db.query(queryStr, [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: userRes.rows[0],
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
