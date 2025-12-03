import * as notificationService from "./notification.server.js";
export const getNotification = async (req, res, next) => {
  const { userId } = req;

  try {
    const notifications = await notificationService.getNotification(userId);
    return res.status(200).json({ data: notifications });
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    const read = await notificationService.markAsRead(id);
    return res.status(200);
  } catch (error) {
    return next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  const { userId } = req;
  try {
    const allRead = await notificationService.markAllAsRead(userId);
    return res.status(200);
  } catch (error) {
    return next(error);
  }
};
