export const getMyFaculties = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("faculties", "fullName email");

  res.json({ faculties: user.faculties });
};