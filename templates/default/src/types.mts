import { type EagerCollection } from "@skipruntime/core";

type UserID = number;
type GroupID = number;
type User = { name: string; active?: boolean; friends: UserID[] };
type Group = { name: string; members: UserID[] };

type ServiceInputs = {
  users: EagerCollection<UserID, User>;
  groups: EagerCollection<GroupID, Group>;
};

type ResourceInputs = {
  users: EagerCollection<UserID, User>;
  activeMembers: EagerCollection<GroupID, UserID>;
};

export type { UserID, GroupID, User, Group, ServiceInputs, ResourceInputs };
