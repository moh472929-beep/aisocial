import express from "express";
import { initDB, getModel } from "../db/init.js";
import { sendSuccess, sendError, sendNotFound, sendUnauthorized  } from "../utils/response.js";
import { logger  } from "../middleware/errorHandler.js";
import { authenticateToken  } from "../middleware/auth.js";

const router = express.Router();

// Use shared JWT authentication middleware
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userModel = getModel('User');
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    sendSuccess(res, userWithoutPassword, 'User profile fetched successfully');
  } catch (error) {
    logger.error('Get profile error:', error);
    sendError(res, 'Server error while fetching user profile');
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, email, subscription } = req.body;
    const userModel = getModel('User');

    // Update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (subscription) updateData.subscription = subscription;

    const updated = await userModel.update(req.user.userId, updateData);

    if (!updated) {
      return sendNotFound(res, 'User not found');
    }

    const user = await userModel.findById(req.user.userId);
    const { passwordHash: _, ...userWithoutPassword } = user;

    sendSuccess(res, userWithoutPassword, 'User profile updated successfully');
  } catch (error) {
    logger.error('Update profile error:', error);
    sendError(res, 'Server error while updating user profile');
  }
});

// Add Facebook page
router.post('/facebook-pages', async (req, res) => {
  try {
    const { pageId, pageName, accessToken } = req.body;

    if (!pageId || !pageName || !accessToken) {
      return sendError(res, 'All page data is required', 'Validation failed', 400);
    }

    const userModel = getModel('User');
    const facebookPageModel = getModel('FacebookPage');

    // Add new page
    const newPage = {
      userId: req.user.userId,
      pageId,
      pageName,
      accessToken,
      createdAt: new Date().toISOString(),
    };

    // Update user information
    await userModel.addFacebookPage(req.user.userId, newPage);

    sendSuccess(res, newPage, 'Facebook page added successfully');
  } catch (error) {
    logger.error('Add Facebook page error:', error);
    sendError(res, 'Server error while adding Facebook page');
  }
});

// Delete Facebook page
router.delete('/facebook-pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const userModel = getModel('User');
    const facebookPageModel = getModel('FacebookPage');

    // Delete page
    await facebookPageModel.delete(req.user.userId, pageId);

    // Update user information
    await userModel.removeFacebookPage(req.user.userId, pageId);

    sendSuccess(res, null, 'Facebook page deleted successfully');
  } catch (error) {
    logger.error('Delete Facebook page error:', error);
    sendError(res, 'Server error while deleting Facebook page');
  }
});

// Update remaining posts count
router.put('/posts-remaining', async (req, res) => {
  try {
    const { postsRemaining } = req.body;

    if (typeof postsRemaining !== 'number') {
      return sendError(res, 'Posts remaining must be a number', 'Validation failed', 400);
    }

    const userModel = getModel('User');
    const updated = await userModel.update(req.user.userId, { postsRemaining });

    if (!updated) {
      return sendNotFound(res, 'User not found');
    }

    sendSuccess(res, { postsRemaining }, 'Posts remaining updated successfully');
  } catch (error) {
    logger.error('Update posts remaining error:', error);
    sendError(res, 'Server error while updating posts remaining');
  }
});

export default router;
