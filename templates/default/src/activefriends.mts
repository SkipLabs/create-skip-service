import {
  type EagerCollection,
  type Json,
  type Mapper,
  type Resource,
  type Values,
} from "@skipruntime/core";

import { GroupID, Group, UserID, User, ResourceInputs } from "./types.mjs";

// Mapper functions for reactive data transformations
class ActiveMembers implements Mapper<GroupID, Group, GroupID, UserID> {
  constructor(private users: EagerCollection<UserID, User>) {}

  // Maps group members to active users only
  mapEntry(gid: GroupID, group: Values<Group>): Iterable<[GroupID, UserID]> {
    return group
      .getUnique()
      .members.flatMap((uid: UserID) =>
        this.users.getUnique(uid).active ? [[gid, uid]] : [],
      );
  }
}

// Filters group members to only include friends of a specific user
class FilterFriends implements Mapper<GroupID, UserID, GroupID, UserID> {
  constructor(private readonly user: User) {}

  mapEntry(gid: GroupID, uids: Values<UserID>): Iterable<[GroupID, UserID]> {
    return uids
      .toArray()
      .flatMap((uid: UserID) =>
        this.user.friends.includes(uid) ? [[gid, uid]] : [],
      );
  }
}

// Resource that provides active friends for a given user
class ActiveFriends implements Resource<ResourceInputs> {
  private readonly uid: UserID;

  constructor(params: Json) {
    if (typeof params != "number")
      throw new Error("Missing required number parameter 'uid'");
    this.uid = params;
  }

  // Creates a collection of active friends for the specified user
  instantiate(inputs: ResourceInputs): EagerCollection<GroupID, UserID> {
    const user = inputs.users.getUnique(this.uid);
    return inputs.activeMembers.map(FilterFriends, user);
  }
}

export { ActiveMembers, ActiveFriends };
