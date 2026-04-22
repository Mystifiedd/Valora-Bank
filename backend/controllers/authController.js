const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, password, role } = req.body;

  const createdUser = await authService.registerUser({
    first_name,
    last_name,
    email,
    phone,
    password,
    roleName: role,
    actor: req.user || null
  });

  return res.status(201).json(createdUser);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const payload = await authService.loginUser({
    email,
    password,
    ipAddress: req.ip
  });

  return res.json(payload);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  return res.json(user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const result = await authService.changePassword(req.user.id, {
    currentPassword: current_password,
    newPassword: new_password
  });
  return res.json(result);
});

const setTransactionPin = asyncHandler(async (req, res) => {
  const { current_pin, new_pin } = req.body;
  const result = await authService.setTransactionPin(req.user.id, {
    currentPin: current_pin,
    newPin: new_pin
  });
  return res.json(result);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { first_name, last_name, phone, email, branch_id } = req.body;
  const updatedUser = await authService.updateProfile(req.user.id, {
    first_name,
    last_name,
    phone,
    email,
    branch_id
  });
  return res.json(updatedUser);
});

module.exports = {
  register,
  login,
  me,
  changePassword,
  setTransactionPin,
  updateProfile
};
