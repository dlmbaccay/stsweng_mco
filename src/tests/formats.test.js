import { formatDateWithWords, checkPassword, checkUsername, checkDisplayName, checkLocation } from '../lib/formats';

// testing proper date formatting
describe('formatDateWithWords', () => {
    test('formats date correctly', () => { 
        const dateString = '2022-01-01';
        const formattedDate = formatDateWithWords(dateString);
        expect(formattedDate).toBe('January 1, 2022');
    });
});

// testing password validation
describe('checkPassword', () => {
    test('returns true for a valid password', () => { 
        const password = 'Password123!';
        const isValid = checkPassword(password);
        expect(isValid).toBe(true);
    });

    test('returns false for an invalid password', () => { 
        const password = 'weakpassword';
        const isValid = checkPassword(password);
        expect(isValid).toBe(false);
    });
});

// testing username validation
describe('checkUsername', () => {
    test('returns true for a valid username', () => { 
        const username = 'john_doe123';
        const isValid = checkUsername(username);
        expect(isValid).toBe(true);
    });

    test('returns false for an invalid username', () => { 
        const username = 'user name';
        const isValid = checkUsername(username);
        expect(isValid).toBe(false);
    });
});

//testing display name validation
describe('checkDisplayName', () => {
    test('returns true for a valid display name', () => { 
        const displayName = 'John Doe';
        const isValid = checkDisplayName(displayName);
        expect(isValid).toBe(true);
    });

    test('returns false for an invalid display name', () => {
        const displayName = '   ';
        const isValid = checkDisplayName(displayName);
        expect(isValid).toBe(false);
    });
});

//testing location validation
describe('checkLocation', () => {
    test('returns true for a valid location', () => {
        const location = 'New York';
        const isValid = checkLocation(location);
        expect(isValid).toBe(true);
    });

    test('returns false for an invalid location', () => {
        const location = ' ';
        const isValid = checkLocation(location);
        expect(isValid).toBe(false);
    });
});
