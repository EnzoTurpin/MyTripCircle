import bcrypt from 'bcrypt';
import User from '../models/User.ts';

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true }
        );

        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt
            },
        });
    } catch (e) {
        console.error("UPDATE PROFILE ERROR", e);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
}

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // Hash new password
        const hashed = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashed;
        await user.save();

        res.json({ success: true });
    } catch (e) {
        console.error("CHANGE PASSWORD ERROR", e);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
}