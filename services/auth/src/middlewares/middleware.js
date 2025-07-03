import Role from '../models/role.model.js';

const checkPermission = (action, menuItems = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(401).json({ 
          message: 'Authentication required',
          error: 'UNAUTHORIZED' 
        });
      }

      const role = await Role.findById(req.user.roleId);
      
      if (!role) {
        return res.status(403).json({ 
          message: 'Role not found',
          error: 'ROLE_NOT_FOUND' 
        });
      }

      console.log('Permission Debug - Checking action:', action);
      console.log('Permission Debug - Role menu permissions:', role.menu);

      // Check menu access first if menuItems are specified
      if (menuItems) {
        const menuArray = Array.isArray(menuItems) ? menuItems : [menuItems];
        let hasMenuAccess = false;

        // Check if role has access to any of the requested menus
        for (const requestedMenu of menuArray) {
          const menuPermission = role.menu.find(menuItem => 
            menuItem.menuName === requestedMenu ||
            menuItem.menuName.toLowerCase() === requestedMenu.toLowerCase() ||
            menuItem.menuName === requestedMenu.charAt(0).toUpperCase() + requestedMenu.slice(1).toLowerCase()
          );

          if (menuPermission) {
            // Check if the menu has the required permission
            let hasRequiredPermission = false;
            
            switch (action) {
              case 'read':
                hasRequiredPermission = menuPermission.read || menuPermission.both;
                break;
              case 'write':
                hasRequiredPermission = menuPermission.write || menuPermission.both;
                break;
              case 'both':
                hasRequiredPermission = menuPermission.both;
                break;
              default:
                hasRequiredPermission = false;
            }

            if (hasRequiredPermission) {
              hasMenuAccess = true;
              break;
            }
          }
        }

        if (!hasMenuAccess) {
          return res.status(403).json({ 
            message: `Access denied. No ${action} permission for menu(s): ${menuArray.join(', ')}`,
            error: 'MENU_ACCESS_DENIED',
            required: { 
              action,
              menuItems: menuArray 
            },
            debug: {
              roleMenus: role.menu,
              requestedMenuItems: menuArray,
              requestedAction: action
            }
          });
        }
      } else {
        // If no specific menu is requested, check if role has any permission for the action
        let hasGlobalPermission = false;

        for (const menuItem of role.menu) {
          switch (action) {
            case 'read':
              if (menuItem.read || menuItem.both) {
                hasGlobalPermission = true;
              }
              break;
            case 'write':
              if (menuItem.write || menuItem.both) {
                hasGlobalPermission = true;
              }
              break;
            case 'both':
              if (menuItem.both) {
                hasGlobalPermission = true;
              }
              break;
          }
          
          if (hasGlobalPermission) break;
        }

        if (!hasGlobalPermission) {
          return res.status(403).json({ 
            message: `Access denied. Insufficient permissions for ${action}`,
            error: 'INSUFFICIENT_PERMISSIONS',
            required: { action },
            debug: {
              roleMenus: role.menu,
              requestedAction: action
            }
          });
        }
      }

      // Add role info to request for use in controllers
      req.userRole = {
        id: role._id,
        name: role.name,
        menu: role.menu,
        // Helper methods for easy permission checking
        hasMenuPermission: (menuName, permission) => {
          const menuItem = role.menu.find(item => 
            item.menuName.toLowerCase() === menuName.toLowerCase()
          );
          if (!menuItem) return false;
          
          switch (permission) {
            case 'read':
              return menuItem.read || menuItem.both;
            case 'write':
              return menuItem.write || menuItem.both;
            case 'both':
              return menuItem.both;
            default:
              return false;
          }
        },
        getMenuNames: () => role.menu.map(item => item.menuName),
        hasAnyPermission: (permission) => {
          return role.menu.some(menuItem => {
            switch (permission) {
              case 'read':
                return menuItem.read || menuItem.both;
              case 'write':
                return menuItem.write || menuItem.both;
              case 'both':
                return menuItem.both;
              default:
                return false;
            }
          });
        }
      };
      
      console.log('Permission Debug - Access granted for:', {
        action,
        menuItems,
        roleMenus: role.menu.map(m => ({
          menuName: m.menuName,
          permissions: { read: m.read, write: m.write, both: m.both }
        }))
      });

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        message: 'Error checking permissions',
        error: 'PERMISSION_CHECK_ERROR' 
      });
    }
  };
};

// Helper middleware to check specific menu permission
const checkMenuPermission = (menuName, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(401).json({ 
          message: 'Authentication required',
          error: 'UNAUTHORIZED' 
        });
      }

      const role = await Role.findById(req.user.roleId);
      
      if (!role) {
        return res.status(403).json({ 
          message: 'Role not found',
          error: 'ROLE_NOT_FOUND' 
        });
      }

      const menuPermission = role.menu.find(menuItem => 
        menuItem.menuName.toLowerCase() === menuName.toLowerCase()
      );

      if (!menuPermission) {
        return res.status(403).json({ 
          message: `Access denied. No access to ${menuName} menu`,
          error: 'MENU_NOT_ACCESSIBLE'
        });
      }

      let hasPermission = false;
      switch (action) {
        case 'read':
          hasPermission = menuPermission.read || menuPermission.both;
          break;
        case 'write':
          hasPermission = menuPermission.write || menuPermission.both;
          break;
        case 'both':
          hasPermission = menuPermission.both;
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. No ${action} permission for ${menuName}`,
          error: 'INSUFFICIENT_MENU_PERMISSIONS'
        });
      }

      // Add role info to request
      req.userRole = {
        id: role._id,
        name: role.name,
        menu: role.menu
      };

      next();
    } catch (error) {
      console.error('Menu permission check error:', error);
      return res.status(500).json({ 
        message: 'Error checking menu permissions',
        error: 'MENU_PERMISSION_CHECK_ERROR' 
      });
    }
  };
};

// Middleware to check if user has access to any of the specified menus
const checkAnyMenuAccess = (menuNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(401).json({ 
          message: 'Authentication required',
          error: 'UNAUTHORIZED' 
        });
      }

      const role = await Role.findById(req.user.roleId);
      
      if (!role) {
        return res.status(403).json({ 
          message: 'Role not found',
          error: 'ROLE_NOT_FOUND' 
        });
      }

      const menuArray = Array.isArray(menuNames) ? menuNames : [menuNames];
      const hasAccess = menuArray.some(menuName => 
        role.menu.some(menuItem => 
          menuItem.menuName.toLowerCase() === menuName.toLowerCase()
        )
      );

      if (!hasAccess) {
        return res.status(403).json({ 
          message: `Access denied. No access to any of the menus: ${menuArray.join(', ')}`,
          error: 'NO_MENU_ACCESS'
        });
      }

      req.userRole = {
        id: role._id,
        name: role.name,
        menu: role.menu
      };

      next();
    } catch (error) {
      console.error('Any menu access check error:', error);
      return res.status(500).json({ 
        message: 'Error checking menu access',
        error: 'MENU_ACCESS_CHECK_ERROR' 
      });
    }
  };
};

export default checkPermission;
export { checkMenuPermission, checkAnyMenuAccess };
