import React, { createContext, useState, useEffect, useContext } from 'react';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
    // Initialize user from localStorage if available
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [chores, setChores] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [budget, setBudget] = useState(0);
    const [toastMessage, setToastMessage] = useState(null);

    const [currentGroup, setCurrentGroup] = useState(null);

    // Persist user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            fetchUserGroups(user.id);
        } else {
            localStorage.removeItem('user');
            setGroups([]);
            setCurrentGroup(null);
        }
    }, [user]);

    useEffect(() => {
        if (currentGroup) {
            fetchGroupChores(currentGroup.id);
            fetchGroupExpenses(currentGroup.id);
        } else {
            setChores([]);
            setExpenses([]);
        }
    }, [currentGroup]);

    const fetchUserGroups = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
                if (data.length > 0 && !currentGroup) {
                    setCurrentGroup(data[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        }
    };

    const fetchGroupChores = async (groupId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/chores/group/${groupId}`);
            if (response.ok) {
                const data = await response.json();
                setChores(data);
            }
        } catch (error) {
            console.error("Failed to fetch chores:", error);
        }
    };

    const fetchGroupExpenses = async (groupId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/expenses/group/${groupId}`);
            if (response.ok) {
                const data = await response.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                return { success: true };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: errorText || "Login failed. Please check your credentials."
                };
            }
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: "Network error. Please try again."
            };
        }
    };

    const register = async (fullName, email, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data); // Automatically log in after registration
                return { success: true };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: errorText || "Registration failed. Please try again."
                };
            }
        } catch (error) {
            console.error("Registration failed:", error);
            return {
                success: false,
                message: "Network error. Please try again."
            };
        }
    };

    const logout = () => {
        setUser(null);
        setChores([]);
        setExpenses([]);
        setGroups([]);
        setCurrentGroup(null);
    };

    const updateBudget = (newBudget) => {
        setBudget(newBudget);
    };

    const addChore = async (chore) => {
        if (!currentGroup) {
            showToast("Please join a group first.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/chores/group/${currentGroup.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chore),
            });
            if (response.ok) {
                const newChore = await response.json();
                setChores([...chores, newChore]);
                showToast("Chore added successfully!");
            }
        } catch (error) {
            console.error("Failed to add chore:", error);
            showToast("Failed to add chore.");
        }
    };

    const toggleChoreStatus = async (id) => {
        const choreToUpdate = chores.find(c => c.id === id);
        if (!choreToUpdate) return;

        const updatedStatus = choreToUpdate.status === 'pending' ? 'completed' : 'pending';
        try {
            const response = await fetch(`http://localhost:8080/api/chores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...choreToUpdate, status: updatedStatus }),
            });
            if (response.ok) {
                const updatedChore = await response.json();
                setChores(chores.map(c => c.id === id ? updatedChore : c));
            }
        } catch (error) {
            console.error("Failed to update chore status:", error);
        }
    };

    const addExpense = async (expense) => {
        if (!currentGroup) {
            showToast("Please join a group first.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/expenses/group/${currentGroup.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...expense, paidById: user.id }),
            });
            if (response.ok) {
                const newExpense = await response.json();
                setExpenses([...expenses, newExpense]);
                showToast("Expense added successfully!");
            }
        } catch (error) {
            console.error("Failed to add expense:", error);
            showToast("Failed to add expense.");
        }
    };

    const markExpensePaid = (id) => {
        // Implement if backend supports status update for expenses, currently Expense entity doesn't have status
        // Assuming for now we just keep it local or remove if not needed
        setExpenses(expenses.map(expense =>
            expense.id === id ? { ...expense, status: 'paid' } : expense
        ));
    };

    const updateChore = async (updatedChore) => {
        try {
            const response = await fetch(`http://localhost:8080/api/chores/${updatedChore.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedChore),
            });
            if (response.ok) {
                const data = await response.json();
                setChores(chores.map(c => c.id === data.id ? data : c));
                showToast("Chore updated successfully!");
            }
        } catch (error) {
            console.error("Failed to update chore:", error);
            showToast("Failed to update chore.");
        }
    };

    const deleteChore = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/chores/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setChores(chores.filter(c => c.id !== id));
                showToast("Chore deleted successfully.");
            }
        } catch (error) {
            console.error("Failed to delete chore:", error);
            showToast("Failed to delete chore.");
        }
    };

    const updateUser = async (updatedUser) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                showToast("Profile updated successfully!");
            } else {
                showToast("Failed to update profile.");
            }
        } catch (error) {
            console.error("Update user failed:", error);
            showToast("Network error. Failed to update profile.");
        }
    };

    // Group Management Functions
    const createGroup = async (groupName) => {
        try {
            const response = await fetch('http://localhost:8080/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: groupName, userId: user.id }),
            });

            if (response.ok) {
                const newGroup = await response.json();
                setGroups([...groups, newGroup]);
                showToast("Group created successfully!");
            } else {
                showToast("Failed to create group.");
            }
        } catch (error) {
            console.error("Create group failed:", error);
            showToast("Network error. Failed to create group.");
        }
    };

    const joinGroup = async (code) => {
        try {
            const response = await fetch('http://localhost:8080/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, userId: user.id }),
            });

            if (response.ok) {
                const joinedGroup = await response.json();
                setGroups([...groups, joinedGroup]);
                showToast("Joined group successfully!");
            } else {
                const errorText = await response.text();
                showToast(errorText || "Failed to join group.");
            }
        } catch (error) {
            console.error("Join group failed:", error);
            showToast("Network error. Failed to join group.");
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setGroups(groups.filter(g => g.id !== groupId));
                showToast("Group deleted successfully.");
            } else {
                showToast("Failed to delete group.");
            }
        } catch (error) {
            console.error("Delete group failed:", error);
            showToast("Network error.");
        }
    };

    const leaveGroup = async (groupId) => {
        // For now, leaving is same as removing self, reusing removeMember logic if needed or just local
        // Ideally backend should have a leave endpoint or use removeMember with own ID
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/removeMember`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });

            if (response.ok) {
                setGroups(groups.filter(g => g.id !== groupId));
                showToast("Left group successfully.");
            } else {
                showToast("Failed to leave group.");
            }
        } catch (error) {
            console.error("Leave group failed:", error);
            showToast("Network error.");
        }
    };

    const addGroupMember = (groupId, memberName) => {
        // This feature (adding by name directly) might not be supported by backend if we require users to exist
        // For now, we'll keep it as a placeholder or remove it if not needed by the new flow (joining by code)
        // The user request emphasized "joining or creating", not manual adding by name without user account
        showToast("Invite members by sharing the group code!");
    };

    const removeGroupMember = async (groupId, memberId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/removeMember`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: memberId }),
            });

            if (response.ok) {
                setGroups(groups.map(group => {
                    if (group.id === groupId) {
                        return {
                            ...group,
                            members: group.members.filter(m => m.id !== memberId)
                        };
                    }
                    return group;
                }));
                showToast("Member removed successfully.");
            } else {
                showToast("Failed to remove member.");
            }
        } catch (error) {
            console.error("Remove member failed:", error);
            showToast("Network error.");
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
    };

    const hideToast = () => {
        setToastMessage(null);
    };

    return (
        <AppDataContext.Provider value={{
            user,
            login,
            register,
            logout,
            chores,
            expenses,
            groups,
            budget,
            toastMessage,
            showToast,
            hideToast,
            updateUser,
            updateBudget,
            addChore,
            updateChore,
            deleteChore,
            toggleChoreStatus,
            addExpense,
            markExpensePaid,
            createGroup,
            joinGroup,
            deleteGroup,
            leaveGroup,
            addGroupMember,
            removeGroupMember,
            currentGroup,
            setCurrentGroup
        }}>
            {children}
        </AppDataContext.Provider>
    );
};
