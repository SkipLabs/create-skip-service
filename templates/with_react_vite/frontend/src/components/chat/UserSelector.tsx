import { useState, useEffect } from "react";
import { initialUsers, type User } from "../../data";

interface UserSelectorProps {
  onUserSelect: (userId: number) => void;
  selectedUserId: number;
}

export function UserSelector({
  onUserSelect,
  selectedUserId,
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(initialUsers);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        setIsLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  if (isLoading) {
    return <div className="user-selector loading">Loading users...</div>;
  }

  if (error) {
    return <div className="user-selector error">Error: {error}</div>;
  }

  return (
    <div className="user-selector" data-user={selectedUserId}>
      <label htmlFor="user-select">Select User: </label>
      <select
        id="user-select"
        value={selectedUserId}
        onChange={(e) => onUserSelect(Number(e.target.value))}
        className="user-select-dropdown"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
