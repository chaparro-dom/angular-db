const Role = require('../models/Role');

const checkRole = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userRole = await Role.findByPk(req.user.roleId);
      
      if (!userRole) {
        return res.status(403).json({ error: 'No tiene rol asignado' });
      }

      const hasPermission = requiredPermissions.every(permission => 
        userRole.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'No tiene permisos suficientes' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkRole; 