import roleRepository from '../respositories/roleRepository.js';

// Create Role
export const createRole = async (req, res) => {
  const { name } = req.body;

  try {
    
    const [findError,existingRole, ] = await roleRepository.findByName(name);
    console.log(existingRole, findError);
    if (findError) {
     
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

   
    const [ error,role] = await roleRepository.insertOne({ name });

    if (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    res.status(201).json({ 
      message: 'Role created successfully', 
      role 
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const [roles, error] = await roleRepository.findMany();

    if (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    res.json({ 
      message: 'Roles retrieved successfully',
      roles 
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    const [role, error] = await roleRepository.findOneById(id);
    
    if (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ 
      message: 'Role retrieved successfully',
      role 
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update role
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
 
    const [existingRole, findError] = await roleRepository.findOneById(id);
    if (findError) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    
    if (name && name !== existingRole.name) {
      const [duplicateRole, duplicateError] = await roleRepository.findByName(name);
      if (duplicateError) {
        return res.status(500).json({ message: 'Something went wrong' });
      }

      if (duplicateRole) {
        return res.status(400).json({ message: 'Role name already exists' });
      }
    }

    // Update role
    const [updatedRole, error] = await roleRepository.findOneAndUpdate(
      { _id: id }, 
      { name }
    );

    if (error || !updatedRole) {
      return res.status(400).json({ message: 'Role update failed' });
    }

    res.json({ 
      message: 'Role updated successfully', 
      role: updatedRole 
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if role exists
    const [existingRole, findError] = await roleRepository.findOneById(id);
    if (findError) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Delete role
    const [result, error] = await roleRepository.deleteOne({ _id: id });
    
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete role' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
