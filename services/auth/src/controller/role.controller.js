import roleRepository from '../respositories/roleRepository.js';

// Create Role
export const createRole = async (req, res) => {
  const { name,menu,read,write,both } = req.body;

  try {
    
    const [findError,existingRole, ] = await roleRepository.findByName(name);
    console.log(existingRole, findError);
    if (findError) {
     console.log(findError);
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (existingRole) {
      return res.status(400).json({ message: 'Role aready exists' });
    }

   
    const [ error,role] = await roleRepository.insertOne({ name,menu,read,write,both});
console.log(name,menu,read,write,both);
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
    const [ error,roles] = await roleRepository.findMany();

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
    const [ error,role] = await roleRepository.findOneById(id);
    
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
  const { name,menu,read,write,both } = req.body;

  try {
 
    const [findError,existingRole] = await roleRepository.findOneById(id);
    console.log(findError,existingRole)
    if (findError) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    
  
    // Update role
    const [ error,updatedRole] = await roleRepository.findOneAndUpdate(
      { _id: id }, 
      { name,menu,read,write,both }
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
    const [findError,existingRole,] = await roleRepository.findOneById(id);
    console.log(findError, existingRole);
    if (findError) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Delete role
    const [error,result] = await roleRepository.deleteOne({ _id: id });
   
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete role' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
