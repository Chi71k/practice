import { sendData } from '../utils/http.js';
import { clearSessionCookie, setSessionCookie } from '../utils/session.js';

export const createAuthController = ({ authService, usersService, config }) => ({
  async register(req, res) {
    const { user, token } = await authService.register(req.body);
    setSessionCookie(res, token, config);
    sendData(res, user, { status: 201 });
  },

  async login(req, res) {
    const { user, token } = await authService.login(req.body);
    setSessionCookie(res, token, config);
    sendData(res, user);
  },

  logout(req, res) {
    authService.logout(req.auth?.sessionToken);
    clearSessionCookie(res, config);
    sendData(res, null);
  },

  me(req, res) {
    sendData(res, req.auth.user);
  },

  updateProfile(req, res) {
    sendData(res, usersService.update(req.auth.user.id, req.body));
  },

  async changePassword(req, res) {
    await usersService.changePassword(req.auth.user.id, req.body);
    clearSessionCookie(res, config);
    sendData(res, null);
  },
});
