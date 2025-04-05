import User from './models/User.js';
import Content from './models/Content.js'; // Added import for Content model
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authenticateToken } from './middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config(true);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const transporter = nodemailer.createTransport({
    service: 'icloud', // Consider using a more robust service for production
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const userRoutes = (app) => {
    app.post('/api/auth/signup', async (req, res) => {
        try {
            const { credential, firstName, lastName, email, password } = req.body;
            let user;

            if (credential) {
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                const { email: googleEmail, given_name, family_name } = ticket.getPayload();
                user = await User.findOne({ email: googleEmail });
                if (!user) {
                    user = new User({
                        email: googleEmail,
                        firstName: given_name,
                        lastName: family_name,
                        // Generate a secure random password for Google signups if needed, or handle differently
                        password: bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10),
                        emailVerified: true,
                        subscriptionStatus: 'free' // Default to free tier
                    });
                    await user.save();
                }
            } else {
                // Check if user already exists with this email
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(409).json({ error: 'Email already in use' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                user = new User({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    subscriptionStatus: 'free', // Default to free tier
                    verificationToken: crypto.randomBytes(32).toString('hex')
                });
                await user.save();

                // Send verification email only for non-Google signups
                // const verificationUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${user.verificationToken}&email=${encodeURIComponent(email)}`;
                // await transporter.sendMail({
                //     to: email,
                //     from: `"Turbocontent Team" <${process.env.EMAIL}>`, // Use a display name
                //     subject: 'Welcome to Turbocontent!',
                //     html: `
                //         <html>
                //         <body style="font-family: 'Arial', sans-serif; color: #333; line-height: 1.6;">
                //             <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                //             <h1 style="color: #2c3e50; text-align: center;">Welcome to Turbocontent!</h1>
                //             <p>Hi ${firstName},</p>
                //             <p>Thanks for joining Turbocontent – your new tool to instantly generate engaging social media content!</p>
                //             <p>Please click the button below to verify your email address and activate your account:</p>
                //             <p style="text-align: center; margin: 25px 0;">
                //                 <a href="${verificationUrl}" style="display: inline-block; padding: 12px 25px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Email</a>
                //             </p>
                //             <p>Once verified, you can start creating platform-optimized posts with relevant images, text, hashtags, and alt text in seconds.</p>
                //             <p>If you have any questions, feel free to contact our support team.</p>
                //             <p>Best regards,<br>The Turbocontent Team</p>
                //             </div>
                //         </body>
                //         </html>
                //     `
                // });
            }

            // Generate token for immediate login after signup
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Add expiration
            // Return user object without password and verification token
            const userResponse = { ...user.toJSON() };
            delete userResponse.password;
            delete userResponse.verificationToken;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            res.status(201).json({ token, user: userResponse });
        } catch (error) {
            console.error('Signup Error:', error);
            // Handle specific errors like Google token verification failure
            if (
                error.message.includes('Invalid token') ||
                error.message.includes('Token used too late')
            ) {
                return res.status(401).json({ error: 'Invalid or expired Google sign-in token' });
            }
            res.status(500).json({ error: 'Registration failed due to a server error' });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // For users who signed up via Google, password might not be set or matchable
            // Allow login if email exists and it's a Google account (e.g., check a flag or if password hash is specific)
            // This example assumes direct password login requires a valid password comparison
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check if email is verified for non-Google signups
            if (!user.emailVerified) {
                // Optionally resend verification email here
                return res
                    .status(403)
                    .json({ error: 'Please verify your email before logging in.' });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Add expiration
            // Return user object without sensitive fields
            const userResponse = { ...user.toJSON() };
            delete userResponse.password;
            delete userResponse.verificationToken;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            res.json({ token, user: userResponse });
        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ error: 'Login failed due to a server error' });
        }
    });

    app.get('/api/profile', authenticateToken, async (req, res) => {
        try {
            // Fetch user and exclude sensitive fields
            const user = await User.findById(req.user.id).select(
                '-password -verificationToken -resetPasswordToken -resetPasswordExpires'
            );
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error('Get Profile Error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    app.put('/api/profile', authenticateToken, async (req, res) => {
        try {
            // Destructure only the fields intended for update from the request body
            const { firstName, lastName, preferences, presentationSettings, researchPreferences } =
                req.body;

            // Prepare update object with only the provided fields
            const updateData = {};
            if (firstName !== undefined) updateData.firstName = firstName;
            if (lastName !== undefined) updateData.lastName = lastName;
            // Note: These fields might need renaming/repurposing for Turbocontent
            if (preferences !== undefined) updateData.preferences = preferences;
            if (presentationSettings !== undefined)
                updateData.presentationSettings = presentationSettings;
            if (researchPreferences !== undefined)
                updateData.researchPreferences = researchPreferences;

            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $set: updateData }, // Use $set to update only specified fields
                { new: true, runValidators: true } // Return updated doc, run schema validators
            ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires'); // Exclude sensitive fields

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (e) {
            console.error('Update Profile Error:', e);
            // Handle validation errors specifically if needed
            if (e.name === 'ValidationError') {
                return res.status(400).json({ error: 'Validation failed', details: e.errors });
            }
            res.status(500).json({ error: 'Failed to update profile' });
        }
    });

    app.post('/api/auth/reset-password', async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                // Avoid revealing if an email exists or not for security
                return res.json({
                    message:
                        'If an account with that email exists, a password reset link has been sent.'
                });
            }

            const resetToken = user.generatePasswordResetToken(); // Assumes this method exists on User model
            await user.save({ validateBeforeSave: false }); // Skip validation to save token fields

            const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`; // Updated frontend route

            await transporter.sendMail({
                to: email,
                from: `"Turbocontent Team" <${process.env.EMAIL}>`,
                subject: 'Turbocontent Password Reset Request',
                html: `
                  <html>
                    <body style="font-family: 'Arial', sans-serif; color: #333; line-height: 1.6;">
                      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                        <h1 style="color: #2c3e50; text-align: center;">Password Reset Request</h1>
                        <p>Hello ${user.firstName || ''},</p>
                        <p>You requested a password reset for your Turbocontent account. Click the button below to set a new password:</p>
                        <p style="text-align: center; margin: 25px 0;">
                          <a href="${resetUrl}" style="display: inline-block; padding: 12px 25px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
                        </p>
                        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
                        <p>Best regards,<br>The Turbocontent Team</p>
                      </div>
                    </body>
                  </html>
                `
            });
            // Send generic success message regardless of user existence
            res.json({
                message:
                    'If an account with that email exists, a password reset link has been sent.'
            });
        } catch (e) {
            console.error('Reset Password Request Error:', e);
            res.status(500).json({ error: 'Failed to send password reset email' });
        }
    });

    app.post('/api/auth/reset-password/:token', async (req, res) => {
        try {
            const { password } = req.body;
            if (!password || password.length < 6) {
                // Add basic password validation
                return res
                    .status(400)
                    .json({ error: 'Password must be at least 6 characters long' });
            }

            // Hash the token from the URL parameter before querying
            const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() } // Check if token is still valid
            });

            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired password reset token' });
            }

            // Set new password and clear reset token fields
            user.password = await bcrypt.hash(password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.emailVerified = true; // Also verify email on successful password reset if not already verified
            await user.save();

            // Optionally log the user in automatically by sending a new JWT
            // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.json({ message: 'Password has been reset successfully.' });
        } catch (e) {
            console.error('Reset Password Error:', e);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    });

    app.get('/api/auth/verify-email', async (req, res) => {
        try {
            const { token, email } = req.query;
            if (!token || !email) {
                return res.status(400).send(`
                  <html><body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #e74c3c;">Verification Failed</h1>
                    <p>Missing verification token or email.</p>
                  </body></html>
                `);
            }

            const user = await User.findOne({ email, verificationToken: token });

            if (!user) {
                // Check if already verified
                const alreadyVerifiedUser = await User.findOne({ email, emailVerified: true });
                if (alreadyVerifiedUser) {
                    return res.send(`
                      <html>
                        <body style="font-family: Arial, sans-serif; background-color:#f4f4f4; color:#333; padding: 20px; text-align: center;">
                          <div style="max-width:600px; margin: auto; padding:20px; background-color:#fff; border-radius:8px;">
                            <h1 style="color:#2ecc71;">Email Already Verified</h1>
                            <p>Your email address has already been verified. You can now log in.</p>
                            <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block; padding:10px 20px; margin-top: 15px; background-color:#3498db; color:#fff; text-decoration:none; border-radius:4px;">Go to Login</a>
                          </div>
                        </body>
                      </html>
                    `);
                }
                // Otherwise, token is invalid or expired
                return res.status(400).send(`
                  <html><body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #e74c3c;">Verification Failed</h1>
                    <p>Invalid or expired verification link.</p>
                  </body></html>
                `);
            }

            user.emailVerified = true;
            user.verificationToken = undefined; // Clear the token
            await user.save();

            res.send(`
              <html>
                <body style="font-family: Arial, sans-serif; background-color:#f4f4f4; color:#333; padding: 20px; text-align: center;">
                  <div style="max-width:600px; margin: auto; padding:20px; background-color:#fff; border-radius:8px;">
                    <h1 style="color:#2ecc71;">Email Verified!</h1>
                    <p>Thank you for verifying your email address for Turbocontent.</p>
                    <p>You can now log in and start generating amazing social media content.</p>
                    <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block; padding:10px 20px; margin-top: 15px; background-color:#3498db; color:#fff; text-decoration:none; border-radius:4px;">Go to Login</a>
                  </div>
                </body>
              </html>
            `);
        } catch (error) {
            console.error('Verify Email Error:', error);
            res.status(500).send(`
              <html><body style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #e74c3c;">Verification Error</h1>
                <p>An unexpected error occurred during email verification. Please try again later or contact support.</p>
              </body></html>
            `);
        }
    });

    // --- Added Endpoints for Content Management ---

    // GET user's generated content
    app.get('/api/profile/content', authenticateToken, async (req, res) => {
        try {
            const content = await Content.find({ userId: req.user.id }).sort({ createdAt: -1 }); // Sort by newest first
            res.json(content);
        } catch (error) {
            console.error('Error fetching user content:', error);
            res.status(500).json({ error: 'Failed to fetch generated content' });
        }
    });

    // DELETE specific generated content item
    app.delete('/api/profile/content/:contentId', authenticateToken, async (req, res) => {
        try {
            const { contentId } = req.params;
            const content = await Content.findOneAndDelete({ _id: contentId, userId: req.user.id });

            if (!content) {
                // Either content doesn't exist or doesn't belong to the user
                return res
                    .status(404)
                    .json({ error: 'Content not found or not authorized to delete' });
            }

            res.status(200).json({ message: 'Content deleted successfully' });
        } catch (error) {
            console.error('Error deleting content:', error);
            // Handle potential CastError if contentId format is invalid
            if (error.name === 'CastError') {
                return res.status(400).json({ error: 'Invalid content ID format' });
            }
            res.status(500).json({ error: 'Failed to delete content' });
        }
    });
};

export default userRoutes;
