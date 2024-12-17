const admin = require("firebase-admin");

// Mock Firebase Admin SDK
jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn().mockReturnThis(),
        get: jest.fn(),
    };
    return {
        firestore: jest.fn(() => firestoreMock),
        initializeApp: jest.fn(),
    };
});

describe('Firestore connection', () => {
    test('should connect to Firestore and retrieve data', async () => {
        const dbMock = admin.firestore();
        
        // Mock Firestore data
        dbMock.collection().get.mockResolvedValue({
            forEach: jest.fn(),
        });

        // Attempt to get data from Firestore
        const snapshot = await dbMock.collection('countries').get();

        // Validate that the collection method was called
        expect(dbMock.collection).toHaveBeenCalledWith('countries');
        // Validate that the get method was called
        expect(snapshot.forEach).toBeDefined();
    });

    test('should handle Firestore connection errors', async () => {
        const dbMock = admin.firestore();

        // Mock Firestore to throw an error
        dbMock.collection().get.mockRejectedValue(new Error("Firestore error"));

        try {
            await dbMock.collection('countries').get();
        } catch (error) {
            // Validate that the error is handled
            expect(error.message).toBe("Firestore error");
        }
    });
});