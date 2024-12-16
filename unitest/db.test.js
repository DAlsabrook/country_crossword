const admin = require("firebase-admin");
const { api } = require("../index");
const request = require("supertest");


// testing for the exports.getCountries
// test if there are 10 getCountries

jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn().mockReturnThis(),
        get: jest.fn(),
        doc: jest.fn().mockReturnThis(),
    };
    return {
        firestore: jest.fn(() => firestoreMock),
        initializeApp: jest.fn(),
    };
});

describe('/getCountries API route', () => {
    test('Randomly selects and Exports 10 countries', async () => {
        // Mock Firestore Country data
        const mockCountries = [
            { id: "CHINA", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "ARGENTINA", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "AUSTRALIA", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "AMERICA", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "ITALY", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "JAPAN", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "GERMANY", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "RUSSIA", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "UNITEDKINGDOM", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
            { id: "FRANCE", data: () => ({ hints: ["Hint 1", "Hint 2"] }) },
        ];

        const dbMock = admin.firestore();
        dbMock.collection().get.mockResolvedValue({
            forEach: (callback) => mockCountries.forEach(callback),
        });

        // Mock Firestore document data for doc
        dbMock.doc().get.mockImplementation(async (docId) => {
            const doc = mockCountries.find((d) => d.id === docId);
            return {
                exists: !! doc,
                data: doc ? doc.data : () => null,
            };
        });

        // Use supertest to make Get request
        const res = await request(api).get("/getCountries");

        // Validate HTTP response status
        expect(res.status).toBe(200);

        // validate response structure
        expect(Object.keys(res.body)).toHaveLength(10);

        // validate that countires exist in data
        Object.keys(res.body).forEach((country) => {
            expect(mockCountries.map((c) => c.id)).toContain(country);

            // Validate hints
            const hints = res.body[country];
            expect(hints).toBeInstanceOf(Array);
            expect(hints.length).toBeGreaterThan(0);
        });
    });

    test("Handles Firestore errors", async () => {
        const dbMock = admin.firestore();

        // Mock Firesstore to throw error
        dbMock.collection().get.mockRejectedValue(new Error("Firestore error"));

        // Send GET request
        const res = await request(api).get("/getCountries");

        // Validate HTTP response status
        expect(res.status).toBe(500);

        // Validate error message
        expect(res.body.error).toBe("Firestore error");
    });
});