import React, { createContext, useState, useEffect, useContext } from 'react';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
    // Initialize state with empty arrays (transient state)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : {
            fullName: 'John Doe',
            email: 'user@email.com',
            dateOfBirth: '2000-01-01',
            gender: 'Male',
            username: 'username',
            password: 'password123',
            profilePicture: null
        };
    });
    const [chores, setChores] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [budget, setBudget] = useState(0);

    // No persistence (localStorage removed)

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

    const updateUser = async (updatedUser) => {
        try {
            // If user has no ID (e.g. default mock user), just update local state
            if (!user.id) {
                const newUser = { ...user, ...updatedUser };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                return;
            }

            const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const data = await response.json();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
            console.error('Error updating user:', error);
            // Fallback to local update if API fails (optional, but good for UX if backend is down)
            const newUser = { ...user, ...updatedUser };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
        }
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

    return (
        <AppDataContext.Provider value={{
            user,
            chores,
            expenses,
            groups,
            budget,
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
