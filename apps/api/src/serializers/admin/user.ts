import userSerializer from "../user";
//@ts-ignore
const adminUserSerializer = (user) => {
    const userData = userSerializer(user);
    //@ts-ignore
    userData.acceptInvitationUrl = user.acceptInvitationUrl;

    return userData;
}

export default adminUserSerializer;