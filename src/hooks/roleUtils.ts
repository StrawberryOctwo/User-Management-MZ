// roleUtils.ts
export const ROLE_HIERARCHY = ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Parent','Student'];

// Function to get the strongest roles for the logged user
export const getStrongestRoles = (userRoles: string[]): string[] => {
    // Filter the user's roles based on the hierarchy
    const filteredRoles = ROLE_HIERARCHY.filter((role) => userRoles.includes(role));

    // Sort the filtered roles according to their position in the hierarchy
    return filteredRoles.sort((a, b) => ROLE_HIERARCHY.indexOf(a) - ROLE_HIERARCHY.indexOf(b));
};
