import roleSerializer from "./role";
import permissionSerializer from "./permission";
import appConfig from "../config/app";
//@ts-ignore
const userSerializer = (user) => {
    let userData = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTIme(),
        status: user.status,
        fullName: user.fullName,
    };

    if (user.role) {
        //@ts-ignore
        userData.role = roleSerializer(user.role);
    }

    if (user.permissions?.length > 0) {
        //@ts-ignore
        userData.permissions = user.permissions.map((permission) =>
            permissionSerializer(permission)
        );
    }

    if (appConfig.isCloud && user.trialExpiryDate) {
        //@ts-ignore
        userData.trialExpiryDate = user.trialExpiryDate;
    }

    return userData;
}

export default userSerializer;