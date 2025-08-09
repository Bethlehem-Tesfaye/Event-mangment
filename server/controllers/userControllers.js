import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";
import prisma from "../lib/prisma.js";

// register

export const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const emailCheck = await prisma.user.findUnique({
      where: { email }
    });

    if (emailCheck) {
      return next(new CustomError("email already registered", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      data: {
        user
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true
      }
    });
    if (!user) {
      return next(new CustomError("Login failed, Please try again", 401));
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return next(new CustomError("Login failed, Please try again", 401));
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      data: {
        user: { id: user.id, email: user.email }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
export const getProfile = async (req, res, next) => {
  const { userId } = req;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return next(new CustomError("no profile", 404));
    }
    return res.status(200).json({
      data: {
        profile
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const setProfile = async (req, res, next) => {
  const { userId } = req;
  const { firstName, lastName, phone, address, country, city } = req.body;

  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        firstName,
        lastName,
        phone,
        address,
        country,
        city
      }
    });

    return res.status(200).json({
      data: {
        profile: updatedProfile
      }
    });
  } catch (error) {
    if (error.code === "P2025") {
      return next(new CustomError("Profile not found", 404));
    }
    return next(error);
  }
};
