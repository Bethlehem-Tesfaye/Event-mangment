import bcrypt from 'bcrypt'
import conn from '../db/db.js';
import jwt  from 'jsonwebtoken';

export const register = async (req, res)=>{
    const {first_name, last_name,email, password } = req.body
    try {
        if(!first_name || !last_name ||!email || !password){
            return res.status(400).json({success:false, message:"all fields requierd"})
        }
        const emailCheck = await conn.query(`SELECT * FROM users WHERE email=$1`, [email])
        if(emailCheck.rows.length >0){
            return res.status(409).json({success:false, message:"email already registered"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES($1,$2,$3,$4) RETURNING id, first_name, last_name, email'
        const values =[first_name,last_name, email, hashedPassword]
        const result = await conn.query(query, values)
        const user = result.rows[0];
        const result2 = await conn.query('INSERT INTO profiles (user_id) VALUES($1)',[user.id])
        const token = jwt.sign(
            {id:user.id},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        )

        res.cookie('token', token, {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({success:true, message:"user registered"})

    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
        
    }
}

export const login = async (req,res)=>{
    const {email, password} = req.body
    try {
        if(!email||!password){
            return res.status(400).json({success:false, message:"all fileds required"})
        }
        const emailCheck = await conn.query('SELECT * from users WHERE email=$1', [email])
        if(emailCheck.rows.length===0){
            return res.status(400).json({success:false, message:"email not registered"})
        }
        const user = emailCheck.rows[0];
        const passwordCheck = await bcrypt.compare(password, user.password)

        if(!passwordCheck){
            return res.status(400).json({success:false, message:"invalid password"})
        }
        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {expiresIn:"1d"})

        res.cookie('token', token, {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'None':'Lax',
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({success:true, message:"succesfully logged in"})

    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const logout = async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'None':'Lax',
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({success:true, message:"successfuly logout"})
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}
export const getProfile = async (req,res)=>{
    const userId = req.userId
    
    try {
        const query = 'SELECT First_name, last_name FROM users WHERE id=$1'
        const result1 = await conn.query(query,[userId])

        if(!result1.rows[0]){
            return res.status(400).json({success:false, message:"no user"})

        }
        const query2 = 'SELECT* FROM profiles WHERE user_id=$1'
        const result2 = await conn.query(query2,[userId])

        if(!result2.rows[0]){
            return res.status(400).json({success:false, message:"no profile"})

        }

        const profile ={
            first_name: result1.rows[0].first_name,
            last_name: result1.rows[0].last_name,
            phone: result2.rows[0]?.phone || "",
            address: result2.rows[0]?.address || "",
            country: result2.rows[0]?.country || "",
            city: result2.rows[0]?.city || "",
        }
        return res.status(200).json({success:true, data:profile, message:"user profile retrived"})


    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const setProfile = async (req, res) => {
  const userId = req.userId;
  const { first_name, last_name, phone, address, country, city } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "No user" });
  }

  try {
    const query1 = 'UPDATE users SET first_name=$1, last_name=$2 WHERE id=$3';
    const query2 = 'UPDATE profiles SET phone=$1, address=$2, country=$3, city=$4 WHERE user_id=$5';

    await conn.query(query1, [first_name, last_name, userId]);
    await conn.query(query2, [phone, address, country, city, userId]);

    return res.status(200).json({ success: true, message: "Profile updated" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


