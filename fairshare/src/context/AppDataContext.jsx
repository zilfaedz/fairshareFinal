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
    const [fairnessScores, setFairnessScores] = useState({});

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
            fetchFairnessScores(currentGroup.id);
            // Keep local budget state in sync with the selected group's stored monthlyBudget
            try {
                setBudget(currentGroup.monthlyBudget || 0);
            } catch (e) {
                setBudget(0);
            }
        } else {
            setChores([]);
            setExpenses([]);
            setFairnessScores({});
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
            let url = `http://localhost:8080/api/expenses/group/${groupId}`;
            if (user && user.id) {
                url += `?userId=${user.id}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    };

    const fetchFairnessScores = async (groupId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/chores/group/${groupId}/fairness-scores`);
            if (response.ok) {
                const data = await response.json();
                setFairnessScores(data);
            }
        } catch (error) {
            console.error("Failed to fetch fairness scores:", error);
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

    const updateBudget = async (newBudget) => {
        // Update locally first for snappy UI
        setBudget(newBudget);

        if (!currentGroup || !currentGroup.id) {
            showToast('No group selected to set budget for.', 'error');
            return { success: false, message: 'No group selected' };
        }

        try {
            const response = await fetch(`http://localhost:8080/api/groups/${currentGroup.id}/budget`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ budget: newBudget }),
            });

            if (response.ok) {
                const updatedGroup = await response.json();
                // Update groups array and currentGroup with persisted value
                setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
                setCurrentGroup(prev => prev && prev.id === updatedGroup.id ? updatedGroup : prev);
                setBudget(updatedGroup.monthlyBudget || newBudget);
                showToast('Monthly budget updated successfully.', 'success');
                return { success: true, data: updatedGroup };
            } else {
                const errorText = await response.text();
                showToast(errorText || 'Failed to update monthly budget.', 'error');
                return { success: false, message: errorText };
            }
        } catch (error) {
            console.error('Failed to update monthly budget:', error);
            showToast('Network error. Failed to update budget.', 'error');
            return { success: false, message: error.message };
        }
    };

    const addChore = async (chore) => {
        if (!currentGroup) {
            showToast("Please join a group first.");
            return;
        }
        try {
            // Validate required fields
            if (!chore.title || !chore.title.trim()) {
                showToast("Please enter a chore title.");
                return;
            }
            if (!chore.date) {
                showToast("Please select a due date.");
                return;
            }

            const response = await fetch(`http://localhost:8080/api/chores/group/${currentGroup.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...chore, creatorId: user.id, useFairAssignment: chore.useFairAssignment || false }),
            });
            if (response.ok) {
                const newChore = await response.json();
                setChores([...chores, newChore]);
                if (currentGroup) fetchFairnessScores(currentGroup.id); // Refresh scores
                showToast("Chore added successfully!");
            } else {
                const errorText = await response.text();
                console.error('Add chore failed:', errorText);
                showToast(errorText || "Failed to add chore.");
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
                if (currentGroup) fetchFairnessScores(currentGroup.id); // Refresh scores
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
        if (!user) {
            showToast("Please log in to add an expense.");
            return;
        }
        try {
            // Filter out fields that backend doesn't need
            const { split, ...cleanedExpense } = expense;

            // Validate required fields
            if (!cleanedExpense.title || !cleanedExpense.title.trim()) {
                showToast("Please enter an expense title.");
                return;
            }
            if (!cleanedExpense.amount || isNaN(parseFloat(cleanedExpense.amount)) || parseFloat(cleanedExpense.amount) <= 0) {
                showToast("Please enter a valid amount greater than 0.");
                return;
            }

            const response = await fetch(`http://localhost:8080/api/expenses/group/${currentGroup.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cleanedExpense, isSplit: split, paidById: user && user.id ? user.id : null }),
            });
            if (response.ok) {
                const newExpense = await response.json();
                setExpenses([...expenses, newExpense]);
                showToast("Expense added successfully!");
            } else {
                const errorText = await response.text();
                console.error('Add expense failed:', errorText);
                showToast(errorText || "Failed to add expense.");
            }
        } catch (error) {
            console.error("Failed to add expense:", error);
            showToast("Failed to add expense.");
        }
    };

    const updateExpense = async (updatedExpense) => {
        if (!updatedExpense || !updatedExpense.id) return;
        try {
            // Ensure isSplit is sent if split exists
            const payload = { ...updatedExpense };
            if (payload.split !== undefined) {
                payload.isSplit = payload.split;
                delete payload.split;
            }

            const response = await fetch(`http://localhost:8080/api/expenses/${updatedExpense.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const data = await response.json();
                setExpenses(expenses.map(e => e.id === data.id ? data : e));
                showToast('Expense updated successfully!');
                return { success: true, data };
            } else {
                const errorText = await response.text();
                showToast(errorText || 'Failed to update expense.');
                return { success: false, message: errorText };
            }
        } catch (error) {
            console.error('Failed to update expense:', error);
            showToast('Failed to update expense.');
            return { success: false, message: error.message };
        }
    };

    const deleteExpense = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/expenses/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setExpenses(expenses.filter(e => e.id !== id));
                showToast('Expense deleted successfully.');
                return { success: true };
            } else {
                const errorText = await response.text();
                showToast(errorText || 'Failed to delete expense.');
                return { success: false, message: errorText };
            }
        } catch (error) {
            console.error('Failed to delete expense:', error);
            showToast('Failed to delete expense.');
            return { success: false, message: error.message };
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

    const updateGroup = async (groupId, name) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const updatedGroup = await response.json();
                setGroups(groups.map(g => g.id === groupId ? updatedGroup : g));
                showToast("Group updated successfully!");
                return { success: true };
            } else {
                showToast("Failed to update group.");
                return { success: false };
            }
        } catch (error) {
            console.error("Update group failed:", error);
            showToast("Network error.");
            return { success: false };
        }
    };

    const joinGroup = async (code) => {
        if (!user || !user.id) {
            showToast("You must be logged in to join a group.");
            return;
        }

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
            showToast(`Network error: ${error.message}`);
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            console.log('Attempting to delete group:', groupId);
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}`, {
                method: 'DELETE',
            });

            console.log('Delete response status:', response.status);
            console.log('Delete response ok:', response.ok);

            if (response.ok) {
                setGroups(groups.filter(g => g.id !== groupId));
                showToast("Group deleted successfully.");
            } else {
                const errorText = await response.text();
                console.error('Delete failed with error:', errorText);
                showToast(`Failed to delete group: ${errorText || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Delete group failed:", error);
            showToast("Network error: " + error.message);
        }
    };

    const transferOwnership = async (groupId, newOwnerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/transfer-ownership`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newOwnerId, requesterId: user.id }),
            });

            if (response.ok) {
                const updatedGroup = await response.json();
                setGroups(groups.map(g => g.id === groupId ? updatedGroup : g));
                if (currentGroup && currentGroup.id === groupId) {
                    setCurrentGroup(updatedGroup);
                }
                showToast("Ownership transferred successfully!");
                return { success: true };
            } else {
                const errorText = await response.text();
                showToast(errorText || "Failed to transfer ownership.");
                return { success: false };
            }
        } catch (error) {
            console.error("Transfer ownership failed:", error);
            showToast("Network error.");
            return { success: false };
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
                body: JSON.stringify({ userId: user.id, requesterId: user.id }),
            });

            if (response.ok) {
                setGroups(groups.filter(g => g.id !== groupId));
                // If the user left the currently selected group, clear group-scoped data
                if (currentGroup && currentGroup.id === groupId) {
                    setCurrentGroup(null);
                    setBudget(0);
                    setExpenses([]);
                    setChores([]);
                }
                showToast("Left group successfully.");
            } else {
                showToast("Failed to leave group.");
            }
        } catch (error) {
            console.error("Leave group failed:", error);
            showToast("Network error.");
        }
    };



    const [notifications, setNotifications] = useState([]);
    const [lastSeenNotificationsAt, setLastSeenNotificationsAt] = useState(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            // Load last seen timestamp for this user from localStorage
            try {
                const key = `lastSeenNotifications_${user.id}`;
                const stored = localStorage.getItem(key);
                if (stored) setLastSeenNotificationsAt(stored);
            } catch (e) {
                console.warn('Failed to load lastSeenNotificationsAt', e);
            }
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setLastSeenNotificationsAt(null);
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const sendInvite = async (groupId, email) => {
        try {
            const response = await fetch('http://localhost:8080/api/notifications/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, email, senderId: user.id }),
            });
            if (response.ok) {
                showToast("Invite sent successfully!");
                return { success: true };
            } else {
                const errorText = await response.text();
                showToast(errorText || "Failed to send invite.");
                return { success: false, message: errorText };
            }
        } catch (error) {
            console.error("Failed to send invite:", error);
            showToast("Network error.");
            return { success: false, message: "Network error." };
        }
    };

    const respondToInvite = async (notificationId, accept) => {
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accept }),
            });
            if (response.ok) {
                showToast(accept ? "Invite accepted!" : "Invite rejected.");
                fetchNotifications();
                fetchUserGroups(user.id); // Refresh groups if accepted
                return { success: true };
            } else {
                showToast("Failed to respond to invite.");
                return { success: false };
            }
        } catch (error) {
            console.error("Failed to respond:", error);
            showToast("Network error.");
            return { success: false };
        }
    };

    const removeGroupMember = async (groupId, memberId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/removeMember`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: memberId, requesterId: user.id }),
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

    const showToast = (message, type) => {
        // message can be a string or an object { text, type }
        if (message && typeof message === 'object' && message.text) {
            setToastMessage({ text: message.text, type: message.type || 'info' });
            return;
        }

        if (!message) return;

        // If caller provided an explicit type, use it. Otherwise, try to infer.
        if (!type) {
            const m = String(message).toLowerCase();

            // If message mentions deletion/removal, keep it red per preference
            if (m.includes('delete') || m.includes('deleted') || m.includes('remove') || m.includes('removed')) {
                type = 'error';
            } else if (m.includes('success') || m.includes('successfully') || m.includes('joined') || m.includes('accepted') || m.includes('copied') || m.includes('created') || m.includes('updated') || m.includes('sent') || m.includes('left')) {
                type = 'success';
            } else if (m.includes('failed') || m.includes('error') || m.includes('network') || m.includes('please')) {
                type = 'error';
            } else {
                type = 'info';
            }
        }

        setToastMessage({ text: String(message), type });
    };

    const hideToast = () => {
        setToastMessage(null);
    };

    const markNotificationsRead = async () => {
        if (!user) return;
        // Optimistically mark all notifications as read locally so the counter resets immediately
        setNotifications(prev => prev ? prev.map(n => ({ ...n, isRead: true, read: true })) : prev);
        // Update last-seen timestamp so the counter counts only notifications after this moment
        const nowIso = new Date().toISOString();
        setLastSeenNotificationsAt(nowIso);
        try {
            const key = `lastSeenNotifications_${user.id}`;
            localStorage.setItem(key, nowIso);
        } catch (e) {
            console.warn('Failed to persist lastSeenNotificationsAt', e);
        }
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/mark-read/${user.id}`, {
                method: 'POST'
            });
            if (response.ok) {
                // Refresh from server to ensure local state matches server
                fetchNotifications();
            } else {
                // If server failed, re-fetch to get authoritative state
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notifications read:', error);
            // On network error, still keep optimistic local change but try to refresh later
        }
    };

    // Compute pending count based on notifications that are newer than lastSeenNotificationsAt
    const pendingCount = (() => {
        if (!notifications || notifications.length === 0) return 0;
        const last = lastSeenNotificationsAt ? new Date(lastSeenNotificationsAt) : new Date(0);
        try {
            return notifications.filter(n => {
                if (!n.createdAt) return false;
                const created = new Date(n.createdAt);
                return created > last;
            }).length;
        } catch (e) {
            return 0;
        }
    })();

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
            updateExpense,
            deleteExpense,
            markExpensePaid,

            createGroup,
            updateGroup,
            joinGroup,
            deleteGroup,
            leaveGroup,
            transferOwnership,
            removeGroupMember,
            currentGroup,
            setCurrentGroup,
            notifications,
            fetchNotifications,
            sendInvite,
            respondToInvite,
            markNotificationsRead,
            pendingCount,
            fairnessScores,
            fetchFairnessScores
        }}>
            {children}
        </AppDataContext.Provider>
    );
};
