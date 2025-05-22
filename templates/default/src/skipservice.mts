import { runService } from "@skipruntime/server";
import { SkipServiceBroker } from "@skipruntime/helpers";

import { ResourceInputs, ServiceInputs } from "./types.mjs";
import { initialData } from "./data.mjs";
import { ActiveFriends, ActiveMembers } from "./activefriends.mjs";


// Service configuration and reactive graph definition
const service = {
    initialData,
    resources: { active_friends: ActiveFriends },
    // Creates the reactive data flow graph
    createGraph(input: ServiceInputs): ResourceInputs {
        const users = input.users;
        const activeMembers = input.groups.map(ActiveMembers, users);
        return { users, activeMembers };
    },
};

// Start the reactive service with specified ports
const server = await runService(service, {
    streaming_port: 8080,
    control_port: 8081,
});

// Initialize the service broker for client communication
const serviceBroker = new SkipServiceBroker({
    host: "localhost",
    control_port: 8081,
    streaming_port: 8080,
});

export { server, serviceBroker };
