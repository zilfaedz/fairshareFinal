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

    // Persist user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

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
        // Clear any other user-specific state here
    };

    const updateBudget = (newBudget) => {
        setBudget(newBudget);
    };

    const addChore = (chore) => {
        setChores([...chores, { ...chore, id: Date.now(), status: 'pending' }]);
    };

    const toggleChoreStatus = (id) => {
        setChores(chores.map(chore =>
            chore.id === id
                ? { ...chore, status: chore.status === 'pending' ? 'completed' : 'pending' }
                : chore
        ));
    };

    const addExpense = (expense) => {
        setExpenses([...expenses, { ...expense, id: Date.now(), status: 'unpaid' }]);
    };

    const markExpensePaid = (id) => {
        setExpenses(expenses.map(expense =>
            expense.id === id ? { ...expense, status: 'paid' } : expense
        ));
    };

    const updateChore = (updatedChore) => {
        setChores(chores.map(chore =>
            chore.id === updatedChore.id ? updatedChore : chore
        ));
    };

    const deleteChore = (id) => {
        setChores(chores.filter(chore => chore.id !== id));
    };

    const updateUser = (updatedUser) => {
        setUser({ ...user, ...updatedUser });
    };

    // Group Management Functions
    const createGroup = (groupName) => {
        const newGroup = {
            id: Date.now(),
            name: groupName,
            code: `GRP${Math.floor(Math.random() * 1000)}`,
            members: [{ id: Date.now(), name: user.fullName }]
        };
        setGroups([...groups, newGroup]);
    };

    const joinGroup = (code) => {
        // Mock join logic
        alert(`Joined group with code: ${code}`);
    };

    const deleteGroup = (groupId) => {
        setGroups(groups.filter(g => g.id !== groupId));
    };

    const leaveGroup = (groupId) => {
        setGroups(groups.filter(g => g.id !== groupId));
    };

    const addGroupMember = (groupId, memberName) => {
        setGroups(groups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    members: [...group.members, { id: Date.now(), name: memberName }]
                };
            }
            return group;
        }));
    };

    const removeGroupMember = (groupId, memberId) => {
        setGroups(groups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    members: group.members.filter(m => m.id !== memberId)
                };
            }
            return group;
        }));
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
            removeGroupMember
        }}>
            {children}
        </AppDataContext.Provider>
    );
};
