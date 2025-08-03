import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

export const register = async (req, res, next) => {
  const { email, password } = req.body;

  const client = await conn.connect();

  try {
    const emailCheck = await client.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return next(new CustomError("email already registered", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    const query =
      "INSERT INTO users (email, password) VALUES($1,$2) RETURNING id, email";
    const values = [email, hashedPassword];
    const result = await client.query(query, values);
    const user = result.rows[0];

    await client.query("INSERT INTO profiles (user_id) VALUES($1)", [user.id]);

    await client.query("COMMIT");

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
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const emailCheck = await conn.query("SELECT * from users WHERE email=$1", [
      email
    ]);
    if (emailCheck.rows.length === 0) {
      return next(new CustomError("Login failed, Please try again", 400));
    }
    const user = emailCheck.rows[0];
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return next(new CustomError("Login failed, Please try again", 400));
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

    return res.status(200);
  } catch (error) {
    return next(error);
  }
};
export const getProfile = async (req, res, next) => {
  const { userId } = req;

  try {
    const query = "SELECT* FROM profiles WHERE user_id=$1";
    const result = await conn.query(query, [userId]);

    if (!result.rows[0]) {
      return next(new CustomError("no profile", 404));
    }

    const profile = {
      first_name: result.rows[0]?.first_name,
      last_name: result.rows[0]?.last_name,
      phone: result.rows[0]?.phone || "",
      address: result.rows[0]?.address || "",
      country: result.rows[0]?.country || "",
      city: result.rows[0]?.city || ""
    };
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
    const query =
      "UPDATE profiles SET first_name=$1, last_name=$2, phone=$3, address=$4, country=$5, city=$6 WHERE user_id=$7 RETURNING *";

    const result = await conn.query(query, [
      firstName,
      lastName,
      phone,
      address,
      country,
      city,
      userId
    ]);
    if (result.rowCount === 0) {
      return next(new CustomError("Profile not found", 404));
    }
    return res.status(200).json({
      data: {
        profile: result.rows[0]
      }
    });
  } catch (error) {
    return next(error);
  }
};
