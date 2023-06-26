// clang-format off
export const HOST_UPDATE_PERIOD: number = 300;  // Period of the main program loop
export const HOST_LIFESPAN: number = 3600000;   // How long the hosting message will be displayed in millis

export const REMOVE_UNWANTED_REACTIONS: boolean = false;        // Remove reactions other than the join reaction and reactions from users other than the host user (May cause excessive API usage)
export const UPDATE_JOIN: boolean = true;                       // Update the "joined" state of the hosting message if the host user reacts to message with the "join reaction"
// clang-format on