
// Notifications removed as per new design request
// Keeping stub to avoid import errors in other files if any

export const notificationsService = {
    registerForPushNotificationsAsync: async () => {
        console.log("Notifications disabled in this version.");
        return null;
    },
};
