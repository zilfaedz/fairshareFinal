import React, { createContext, useState, useEffect, useContext } from 'react';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
    // Initialize state with empty arrays (transient state)
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'user@email.com',
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        username: 'username',
        password: 'password123',
        profilePicture: null
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

    const updateUser = (updatedUser) => {
        setUser({ ...user, ...updatedUser });
    };

    // Group Management Functions
    const createGroup = (groupName) => {
        const newGroup = {
            id: Date.now(),
            name: groupName,
            code: `GRP${Math.floor(Math.random() * 1000)}`,
            members: [{ id: Date.now(), name: user.name }]
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

    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (message) => {
        setToastMessage(message);
    };

    const hideToast = () => {
        setToastMessage(null);
    };

    return (
        <AppDataContext.Provider value={{
            user,
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
