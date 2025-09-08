import mongoose from 'mongoose';
import roleRepository from '../respositories/roleRepository.js';

// Create Role
export const createRole = async (req, res) => {
  const { name, menuPermissions } = req.body;

  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    if (!menuPermissions || Object.keys(menuPermissions).length === 0) {
      return res.status(400).json({ message: 'At least one menu permission is required' });
    }

    // Check if role already exists
    const [findError, existingRole] = await roleRepository.findByName(name);
  
    
    if (findError) {
   
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    // Convert frontend menuPermissions to database format
    const menu = Object.keys(menuPermissions).map(menuName => ({
      menuName,
      read: menuPermissions[menuName].read || false,
      write: menuPermissions[menuName].write || false,
      both: menuPermissions[menuName].both || false
    }));

    const [error, role] = await roleRepository.insertOne({ 
      name, 
      menu
    });

  

    if (error) {
    
      return res.status(500).json({ message: 'Something went wrong' });
    }

    res.status(201).json({ 
      message: 'Role created successfully', 
      role 
    });
  } catch (err) {
    console.error('Create role error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const { page, pageSize, sortBy = 'createdAt', sortOrder = 'desc', search, menuName } = req.query;

    let baseFilter = {};
    if (!req.user.isSuperAdmin) {
      baseFilter = { isSuperAdmin : false, _id : { $ne: new mongoose.Types.ObjectId(req?.user?.roleId) } }
    }

    // Use pagination if page and pageSize are provided
    if (page || pageSize) {
      const options = {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortBy,
        sortOrder,
        search,
        menuName
      };

      const [error, result] = await roleRepository.getManyWithPagination(baseFilter,options);

      if (error) {
        return res.status(500).json({ message: 'Something went wrong' });
      }

      // Convert roles to frontend format
      const rolesWithFormattedMenu = result.items.map(role => ({
        ...role.toObject(),
        menuPermissions: role.menu.reduce((acc, menuItem) => {
          acc[menuItem.menuName] = {
            read: menuItem.read,
            write: menuItem.write,
            both: menuItem.both
          };
          return acc;
        }, {}),
        menuNames: role.menu.map(item => item.menuName)
      }));

      res.json({
        message: 'Roles retrieved successfully',
        items: rolesWithFormattedMenu,
        pagination: result.pagination
      });
    } else {
      // Get all roles without pagination
      const [error, roles] = await roleRepository.findMany(baseFilter);
      console.log(baseFilter);
      if (error) {
        return res.status(500).json({ message: 'Something went wrong' });
      }

      // Convert roles to frontend format
      const rolesWithFormattedMenu = roles.map(role => ({
        ...role.toObject(),
        menuPermissions: role.menu.reduce((acc, menuItem) => {
          acc[menuItem.menuName] = {
            read: menuItem.read,
            write: menuItem.write,
            both: menuItem.both
          };
          return acc;
        }, {}),
        menuNames: role.menu.map(item => item.menuName)
      }));

      res.json({ 
        message: 'Roles retrieved successfully',
        roles: rolesWithFormattedMenu 
      });
    }
  } catch (err) {
    console.error('Get all roles error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    const [error, role] = await roleRepository.findOneById(id);
    
    if (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Convert to frontend format
    const roleWithFormattedMenu = {
      ...role.toObject(),
      menuPermissions: role.menu.reduce((acc, menuItem) => {
        acc[menuItem.menuName] = {
          read: menuItem.read,
          write: menuItem.write,
          both: menuItem.both
        };
        return acc;
      }, {}),
      menuNames: role.menu.map(item => item.menuName)
    };

    res.json({ 
      message: 'Role retrieved successfully',
      role: roleWithFormattedMenu 
    });
  } catch (err) {
    console.error('Get role by ID error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update role
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, menuPermissions } = req.body;

  try {
    // Check if role exists
    const [findError, existingRole] = await roleRepository.findOneById(id);
    console.log(findError, existingRole);
    
    if (findError) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prepare update data
    const updateData = {};
    
    if (name) {
      updateData.name = name;
    }

    if (menuPermissions) {
      // Convert frontend menuPermissions to database format
      updateData.menu = Object.keys(menuPermissions).map(menuName => ({
        menuName,
        read: menuPermissions[menuName].read || false,
        write: menuPermissions[menuName].write || false,
        both: menuPermissions[menuName].both || false
      }));
    }

    // Update role
    const [error, updatedRole] = await roleRepository.findOneAndUpdate(
      { _id: id }, 
      updateData,
      { new: true }
    );

    if (error || !updatedRole) {
      return res.status(400).json({ message: 'Role update failed' });
    }

    // Convert to frontend format
    const roleWithFormattedMenu = {
      ...updatedRole.toObject(),
      menuPermissions: updatedRole.menu.reduce((acc, menuItem) => {
        acc[menuItem.menuName] = {
          read: menuItem.read,
          write: menuItem.write,
          both: menuItem.both
        };
        return acc;
      }, {}),
      menuNames: updatedRole.menu.map(item => item.menuName)
    };

    res.json({ 
      message: 'Role updated successfully', 
      role: roleWithFormattedMenu 
    });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if role exists
    const [findError, existingRole] = await roleRepository.findOneById(id);
    console.log(findError, existingRole);
    
    if (findError) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (existingRole?.isSuperAdmin) {
      return res.status(400).json({ message: "Invalid request." });
    }

    // Delete role
    const [error, result] = await roleRepository.deleteOne({ _id: id });
   
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete role' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Delete role error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get available menus
export const getAvailableMenus = async (req, res) => {
  try {
    const [error, menus] = await roleRepository.getAvailableMenus();

    if (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    res.json({
      message: 'Available menus retrieved successfully',
      menus
    });
  } catch (err) {
    console.error('Get available menus error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
