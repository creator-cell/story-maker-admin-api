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

      
      let hasPermission = false;
      
      console.log('Permission Debug - Checking action:', action);
      console.log('Permission Debug - Role permissions:', {
        read: role.read,
        write: role.write,
        both: role.both
      });
      
      switch (action) {
        case 'read':
          hasPermission = role.read || role.both;
          break;
        case 'write':
          hasPermission = role.write || role.both;
          break;
        case 'both':
          hasPermission = role.both;
          break;
        default:
          hasPermission = false;
      }

      console.log('Permission Debug - Has permission:', hasPermission);

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. Insufficient permissions for ${action}`,
          error: 'INSUFFICIENT_PERMISSIONS',
          required: { action },
          debug: {
            rolePermissions: {
              read: role.read,
              write: role.write,
              both: role.both
            },
            requestedAction: action
          }
        });
      }

     
      if (menuItems && role.menu) {
      
        const menuArray = Array.isArray(menuItems) ? menuItems : [menuItems];
        
       
        let hasMenuAccess = false;
        
        if (Array.isArray(role.menu)) {
        
          hasMenuAccess = menuArray.some(item => 
            role.menu.includes(item) || 
            role.menu.includes(item.toLowerCase()) ||
            role.menu.includes(item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
          );
        } else if (typeof role.menu === 'object') {
       
          hasMenuAccess = menuArray.some(item => 
            role.menu[item] === true || 
            role.menu[item.toLowerCase()] === true ||
            (typeof role.menu[item] === 'object' && role.menu[item]?.access === true)
          );
        }

     
        if (!hasMenuAccess) {
          return res.status(403).json({ 
            message: `Access denied. No menu access for: ${menuArray.join(', ')}`,
            error: 'MENU_ACCESS_DENIED',
            required: { menuItems: menuArray },
            debug: {
              roleMenu: role.menu,
              requestedMenuItems: menuArray
            }
          });
        }
      }

      // Add role info to request
      req.userRole = {
        name: role.name,
        permissions: {
          read: role.read,
          write: role.write,
          both: role.both
        },
        menu: role.menu
      };
      
   
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

export default checkPermission;
