import mongoose from "mongoose";
import connectDB from "./db";
import colors from "colors";

// mock mongoose
jest.mock("mongoose");

describe("Given db.js", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test("When connecting to mongoDB database using the correct inputs", async () => {
        const mockedConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mongoose.connect.mockResolvedValueOnce({connection: {host: 'testhost'}});

        const result = await connectDB();
        //then the connection should be established successfully
        expect(mockedConsoleLog).toHaveBeenCalledWith(
            expect.stringContaining('Connected To Mongodb Database testhost')
        );
        
        mockedConsoleLog.mockRestore();
    });

    test("When connection fails", async() => {
        const mockedConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        const error = Error("Connection failed");
        mongoose.connect.mockRejectedValueOnce(error);

        await connectDB();
        expect(mockedConsoleLog).toHaveBeenCalledWith(
            expect.stringContaining(`Error in Mongodb ${error}`)
        );
        
        mockedConsoleLog.mockRestore();
    });
});
