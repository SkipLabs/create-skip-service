import { InitialData } from "@skipruntime/core";
import { ServiceInputs } from "./types.mjs";

// Initial data for the social network service
const initialData: InitialData<ServiceInputs> = {
  users: [
    [0, [{ name: "Bob", active: true, friends: [1, 2] }]],
    [1, [{ name: "Alice", active: true, friends: [0, 2] }]],
    [2, [{ name: "Carol", active: false, friends: [0, 1] }]],
    [3, [{ name: "Eve", active: true, friends: [] }]],
  ],
  groups: [
    [1001, [{ name: "Group 1", members: [1, 2, 3] }]],
    [1002, [{ name: "Group 2", members: [0, 2] }]],
  ],
};

export { initialData };
