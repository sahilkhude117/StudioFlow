import permissionSerializer from "./permission";
//@ts-ignore
const roleSerializer = (role) => {
    let roleData = {
        id: role.id,
        name: role.name,
        key: role.key,
        description: role.description,
        createdAt: role.createdAt.getTime(),
        updatedAt: role.updatedAt.getTime(),
        isAdmin: role.isAdmin,
    };

    if (role.permission?.length > 0) {
        //@ts-ignore
        roleData.permissions = role.permissions.map((permission) => 
            permissionSerializer(permission)
        );
    }

    return roleData;
};

export default roleSerializer;