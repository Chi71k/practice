import {
  paginationMeta,
  parsePagination,
  sendData,
} from '../utils/http.js';

export const createAdminController = ({ usersService }) => ({
  listUsers(req, res) {
    const pagination = parsePagination(req.validatedQuery ?? req.query);
    const result = usersService.list(pagination);
    sendData(res, result.items, {
      meta: paginationMeta({ ...pagination, total: result.total }),
    });
  },

  getUser(req, res) {
    sendData(res, usersService.getById(req.params.id));
  },

  async createUser(req, res) {
    sendData(res, await usersService.create(req.body), { status: 201 });
  },

  updateUser(req, res) {
    sendData(res, usersService.update(req.params.id, req.body));
  },

  updateRole(req, res) {
    sendData(res, usersService.changeRole(req.params.id, req.body.role));
  },

  deleteUser(req, res) {
    usersService.delete(req.params.id, req.auth.user.id);
    sendData(res, null);
  },
});
