// clang-format off
export const HOST_UPDATE_PERIOD: number = 300;  // Period of the main program loop
export const HOST_LIFESPAN: number = 30000;     // How long the hosting message will be displayed in millis
export const JOIN_LIFESPAN: number = 5000;      //How long the hosting message will be displayed after join, in millis (if equal or lesser than 0, disabled)

export const REMOVE_UNWANTED_REACTIONS: boolean = false;        // Remove reactions other than the join reaction and reactions from users other than the host user (May cause excessive API usage)
// clang-format on