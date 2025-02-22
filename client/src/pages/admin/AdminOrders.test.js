import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import AdminOrders from './AdminOrders';
import { useAuth } from "../../context/auth";

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div>
        <title>{title}</title>
        <main>{children}</main>
    </div>
));

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn()
}));

jest.mock("mongoose", () => ({
    models: {},
    model: jest.fn(),
    Schema: jest.fn(),
    connect: jest.fn(),
    connection: { close: jest.fn() },
}));

describe('AdminOrders Component', () => {
    const getPaymentStatus = (success) => (success ? "Success" : "Failed");

    const mockOrder1 = {
        _id: 'order-1',
        status: 'Processing',
        buyer: { name: 'John Doe' },
        createdAt: '2025-10-02T12:00:00Z',
        payment: { success: true },
        products: [
            {
                _id: 'product-1',
                name: 'Textbook',
                description: 'Book for you!',
                price: 10.99,
            },
        ],
    };

    const mockOrder2 = {
        _id: 'order-2',
        status: 'Not Process',
        buyer: { name: 'Doe John' },
        createdAt: '2024-09-12T12:59:59Z',
        payment: { success: false },
        products: [
            {
                _id: 'product-3',
                name: 'Lunchbox',
                description: 'Lunch for you!',
                price: 12.99,
            },
            {
                _id: 'product-2',
                name: 'Laptop',
                description: 'Real gamer!',
                price: 1000,
            },
        ],
    };

    beforeEach(async () => {
        jest.clearAllMocks();
    });

    describe('Rendering Tables', () => {
        it('does not render any table when there are 0 orders', async () => {
            axios.get.mockResolvedValue({ data: [] });
            useAuth.mockReturnValue([{ token: 'mock-token' }, jest.fn()]);

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={['/admin/orders']}>
                        <Routes>
                            <Route path="/admin/orders" element={<AdminOrders />} />
                        </Routes>
                    </MemoryRouter>
                );
            });

            expect(screen.getByText('All Orders')).toBeInTheDocument();

            expect(screen.queryByText('#')).not.toBeInTheDocument();
            expect(screen.queryByText('Status')).not.toBeInTheDocument();
            expect(screen.queryByText('Buyer')).not.toBeInTheDocument();
            expect(screen.queryByText('Date')).not.toBeInTheDocument();
            expect(screen.queryByText('Payment')).not.toBeInTheDocument();
            expect(screen.queryByText('Quantity')).not.toBeInTheDocument();
        });

        it('renders table with 1 order', async () => {
            useAuth.mockReturnValue([{ token: 'mock-token' }, jest.fn()]);
            axios.get.mockResolvedValue({ data: [mockOrder1] });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={['/admin/orders']}>
                        <Routes>
                            <Route path="/admin/orders" element={<AdminOrders />} />
                        </Routes>
                    </MemoryRouter>
                );
            });

            await waitFor(() => {
                expect(screen.getByText('All Orders')).toBeInTheDocument();

                expect(screen.queryByText('#')).toBeInTheDocument();
                expect(screen.queryByText('Status')).toBeInTheDocument();
                expect(screen.queryByText('Buyer')).toBeInTheDocument();
                expect(screen.queryByText('Date')).toBeInTheDocument();
                expect(screen.queryByText('Payment')).toBeInTheDocument();
                expect(screen.queryByText('Quantity')).toBeInTheDocument();

                expect(screen.getByText(mockOrder1.buyer.name)).toBeInTheDocument();
                expect(screen.getByText(mockOrder1.status)).toBeInTheDocument();
                expect(screen.getByText(getPaymentStatus(mockOrder1.payment.success))).toBeInTheDocument();
                expect(screen.getByText(mockOrder1.products[0].name.toString())).toBeInTheDocument();
                expect(screen.getByText(`Price : ${mockOrder1.products[0].price}`)).toBeInTheDocument();
            });

            expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
        });

        it('renders table with 2 orders', async () => {
            useAuth.mockReturnValue([{ token: 'mock-token' }, jest.fn()]);
            axios.get.mockResolvedValue({ data: [mockOrder1, mockOrder2] });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={['/admin/orders']}>
                        <Routes>
                            <Route path="/admin/orders" element={<AdminOrders />} />
                        </Routes>
                    </MemoryRouter>
                );
            });

            await waitFor(() => {
                expect(screen.getByText('All Orders')).toBeInTheDocument();

                expect(screen.getAllByText('#')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Status')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Buyer')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Date')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Payment')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Quantity')[0]).toBeInTheDocument();

                expect(screen.getByText(mockOrder1.buyer.name)).toBeInTheDocument();
                expect(screen.getByText(mockOrder1.status)).toBeInTheDocument();
                expect(screen.getByText(getPaymentStatus(mockOrder1.payment.success))).toBeInTheDocument();
                expect(screen.getByText(mockOrder1.products[0].name.toString())).toBeInTheDocument();
                expect(screen.getByText(`Price : ${mockOrder1.products[0].price}`)).toBeInTheDocument();

                expect(screen.getAllByText('#')[1]).toBeInTheDocument();
                expect(screen.getAllByText('Status')[1]).toBeInTheDocument();
                expect(screen.getAllByText('Buyer')[1]).toBeInTheDocument();
                expect(screen.getAllByText('Date')[1]).toBeInTheDocument();
                expect(screen.getAllByText('Payment')[1]).toBeInTheDocument();
                expect(screen.getAllByText('Quantity')[1]).toBeInTheDocument();

                expect(screen.getByText(mockOrder2.buyer.name)).toBeInTheDocument();
                expect(screen.getByText(mockOrder2.status)).toBeInTheDocument();
                expect(screen.getByText(getPaymentStatus(mockOrder2.payment.success))).toBeInTheDocument();
                expect(screen.getByText(mockOrder2.products[0].name.toString())).toBeInTheDocument();
                expect(screen.getByText(`Price : ${mockOrder2.products[0].price}`)).toBeInTheDocument();

                expect(screen.getByText(mockOrder2.buyer.name)).toBeInTheDocument();
                expect(screen.getByText(mockOrder2.status)).toBeInTheDocument();
                expect(screen.getByText(getPaymentStatus(mockOrder2.payment.success))).toBeInTheDocument();
                expect(screen.getByText(mockOrder2.products[1].name.toString())).toBeInTheDocument();
                expect(screen.getByText(`Price : ${mockOrder2.products[1].price}`)).toBeInTheDocument();
            });

            expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
        });
    });

    // ideally, we should have status tests
    // to check if all the statuses are available in the menu
    // as well as if the status can be changed
    // however, there is an issue where fireEvent.click will not show additional options

    // reason for no coverage of AdminOrders.js 36-42, 73

    // describe("Order Status Tests", () => {
    //     it("updates order status when a new status is selected", async () => {
    //         useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    //         axios.get.mockResolvedValue({ data: [mockOrder1] });
    //         axios.put.mockResolvedValue({ data: { success: true } });
    
    //         await act(async () => {
    //             render(
    //                 <MemoryRouter initialEntries={["/admin/orders"]}>
    //                     <Routes>
    //                         <Route path="/admin/orders" element={<AdminOrders />} />
    //                     </Routes>
    //                 </MemoryRouter>
    //             );
    //         });
    
    //         await waitFor(() => {
    //             expect(screen.getByText(mockOrder1.buyer.name)).toBeInTheDocument();
    //         });
    
    //         // Find the Select dropdown
    //         const selectDropdown = screen.getByDisplayValue(mockOrder1.status);
    //         expect(selectDropdown).toBeInTheDocument();
    
    //         // Simulate changing the order status
    //         fireEvent.change(selectDropdown, { target: { value: "Shipped" } });
    
    //         await waitFor(() => {
    //             expect(axios.put).toHaveBeenCalledWith(
    //                 `/api/v1/auth/order-status/${mockOrder1._id}`,
    //                 { status: "Shipped" }
    //             );
    //         });
    
    //         expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    //     });
    
    //     it("handles API error gracefully when updating status fails", async () => {
    //         useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    //         axios.get.mockResolvedValue({ data: [mockOrder1] });
    //         axios.put.mockRejectedValue(new Error("Failed to update status"));
    
    //         await act(async () => {
    //             render(
    //                 <MemoryRouter initialEntries={["/admin/orders"]}>
    //                     <Routes>
    //                         <Route path="/admin/orders" element={<AdminOrders />} />
    //                     </Routes>
    //                 </MemoryRouter>
    //             );
    //         });
    
    //         await waitFor(() => {
    //             expect(screen.getByText(mockOrder1.buyer.name)).toBeInTheDocument();
    //         });
    
    //         // Find the Select dropdown
    //         const selectDropdown = screen.getByDisplayValue(mockOrder1.status);
    //         expect(selectDropdown).toBeInTheDocument();
    
    //         // Simulate changing the order status
    //         fireEvent.change(selectDropdown, { target: { value: "Shipped" } });
    
    //         await waitFor(() => {
    //             expect(axios.put).toHaveBeenCalledWith(
    //                 `/api/v1/auth/order-status/${mockOrder1._id}`,
    //                 { status: "Shipped" }
    //             );
    //         });
    
    //         // Ensure that axios.get is not called again due to the error
    //         expect(axios.get).not.toHaveBeenCalledTimes(2);
    //     });
    // });
    
    
});
