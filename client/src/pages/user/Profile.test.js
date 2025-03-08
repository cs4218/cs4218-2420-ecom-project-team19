import React from "react";
import Profile from "./Profile";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import { act, render, screen, waitFor, fireEvent } from "@testing-library/react";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn()
}));

jest.mock("react-hot-toast");

jest.mock("./../../components/Layout", () => ({children, title}) => (
    <div>
        <title>{title}</title>
        <main>{children}</main>
    </div>
));

jest.mock("./../../components/UserMenu", () => () => (
    <div>
        UserMenu
    </div>
));

Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
    },
    writable: true,
});

const mockedAuth = {
    user: {
        name: "User1",
        email: "test@gmail.com",
        phone: "12345678",
        password: "test1234",
        address: "Kent Ridge 123"
    },
    token: "mock token"
};

const setAuth = jest.fn();

const newName = "New name";
const newEmail = "new@gmail.com";
const newPassword = "new12345";
const newPhone = "11112222";
const newAddress = "New street";

describe("Given Profile component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([mockedAuth, setAuth]);

        render(<Profile/>);
    });

    // Test UI
    test("When profile components are rendered", () => {
        expect(screen.getByText("UserMenu")).toBeInTheDocument();
        expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
        expect(screen.getByText("UPDATE")).toBeInTheDocument();
    });

    // test that inputs fields are rendered
    // Bug found: duplicates found in ids for input fields
    test("When input fields are rendered", () => {
        expect(screen.getByPlaceholderText("Enter Your Name")).toHaveAttribute("id", "exampleInputName");
        expect(screen.getByPlaceholderText("Enter Your Email")).toHaveAttribute("id", "exampleInputEmail");
        expect(screen.getByPlaceholderText("Enter Your Password")).toHaveAttribute("id", "exampleInputPassword");
        expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveAttribute("id", "exampleInputPhone");
        expect(screen.getByPlaceholderText("Enter Your Address")).toHaveAttribute("id", "exampleInputAddress");
    });

    test("When auth is not empty", () => {
        // Check if input fields have the correct initial values
        expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(mockedAuth.user.name);
        expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(mockedAuth.user.email);
        expect(screen.getByPlaceholderText("Enter Your Password").value).toBe("");
        expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(mockedAuth.user.phone);
        expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(mockedAuth.user.address);
    });

    test("When name input field is changed", () => {
        const inputElement = screen.getByPlaceholderText("Enter Your Name");
        fireEvent.change(inputElement, { target: { value: newName}});

        expect(inputElement.value).toBe(newName);
    });

    test("When email input field is changed", () => {
        const inputElement = screen.getByPlaceholderText("Enter Your Email");
        fireEvent.change(inputElement, { target: { value: newEmail}});

        expect(inputElement.value).toBe(newEmail);
    });

    test("When password input field is changed", () => {
        const inputElement = screen.getByPlaceholderText("Enter Your Password");
        fireEvent.change(inputElement, { target: { value: newPassword}});

        expect(inputElement.value).toBe(newPassword);
    });

    test("When phone input field is changed", () => {
        const inputElement = screen.getByPlaceholderText("Enter Your Phone");
        fireEvent.change(inputElement, { target: { value: newPhone}});

        expect(inputElement.value).toBe(newPhone);
    });

    test("When address input field is changed", () => {
        const inputElement = screen.getByPlaceholderText("Enter Your Address");
        fireEvent.change(inputElement, { target: { value: newAddress}});

        expect(inputElement.value).toBe(newAddress);
    });

    test("When profile is updated successfully", async () => {
        const newName = "New name";
        const updatedUser = {
            ...mockedAuth.user,
            name: newName,
        };

        // mock successful API call
        axios.put.mockResolvedValue({ 
            data: { 
                success: true,
                updatedUser: updatedUser,
                token: "mock token"
            }
        });

        localStorage.getItem.mockReturnValueOnce(JSON.stringify(updatedUser));

        const inputElement = screen.getByPlaceholderText("Enter Your Name");
        fireEvent.change(inputElement, { target: { value: newName}});

        expect(inputElement.value).toBe(newName);

        //click update
        fireEvent.click(screen.getByText("UPDATE"));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                "/api/v1/auth/profile", 
                {...updatedUser, password: ""}
            );

            expect(localStorage.setItem).toHaveBeenCalledWith(
                "auth",
                expect.stringContaining(newName)
            );
        });

        expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    });

    //Bug found: "data?.errro" spelling mistake
    test("When API returns an error", async () => {
        // mock successful API call
        axios.put.mockResolvedValue({ data: {
            error: "Data error"
        }});

        fireEvent.click(screen.getByText("UPDATE"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Data error")
        });
    });

    test("When API call fails", async () => {
        axios.put.mockRejectedValueOnce(
            new Error("API error")
        );

        fireEvent.click(screen.getByText("UPDATE"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong")
        });
    })
});
