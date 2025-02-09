import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import UpdateProduct from './UpdateProduct'

jest.mock('axios')
jest.mock('react-hot-toast')

global.URL.createObjectURL = jest.fn(() => 'mock-url')
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}))

jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div>
      <title>{title}</title>
      <main>{children}</main> 
    </div>
));

jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu</div>)

jest.mock('antd', () => ({
    Select: Object.assign(
        ({ children, onChange, value, placeholder }) => (
            <select
                data-testid='category-select'
                onChange={(e) => onChange(e.target.value)}
                value={value}
                aria-label={placeholder}
            >
                {children}
            </select>
        ),
        { Option: ({ children, value }) => <option value={value}>{children}</option> }
    ),
}))

describe('UpdateProduct Component', () => {
    const mockProductCategory1 = {
        _id: '1',
        name: 'Test Product 1',
        description: 'Test Description 1',
        price: 100,
        quantity: 10,
        category: { _id: 'cat1', name: 'Category 1' },
        shipping: true,
        imageAlt: 'test',
        imageName: 'test.png',
        imageType: 'image/png'
    };

    const updateProductButtonText = 'UPDATE PRODUCT';

    const UPDATE_SUCCESS_MESSAGE = 'Product Updated Successfully';
    const UPDATE_ERROR_MESSAGE = 'Product Update Unsuccessful';
    const BACKEND_ERROR_MESSAGE = 'something went wrong';

    const mockCategories = [
        { _id: 'cat1', name: 'Category 1' },
        { _id: 'cat2', name: 'Category 2' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        axios.get.mockResolvedValueOnce({ data: { product: mockProductCategory1 } })
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        axios.put.mockResolvedValue({ data: { success: true } })
    })

    describe('Component Rendering', () => {
        // equivalence partitioning: ensures component renders correctly
        it('renders without crashing', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('Update Product')).toBeInTheDocument();
            });
        });

        it('uses existing product data to populate fields', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByDisplayValue(mockProductCategory1.name)).toBeInTheDocument();
                expect(screen.getByDisplayValue(mockProductCategory1.description)).toBeInTheDocument();
                expect(screen.getByDisplayValue(mockProductCategory1.price)).toBeInTheDocument();
                expect(screen.getByDisplayValue(mockProductCategory1.quantity)).toBeInTheDocument();
            });
        });

        // equivalence partitioning: ensures category dropdown is populated
        it('correctly populates categories', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const categorySelect = screen.getByRole('combobox', { name: /select a category/i });
                expect(categorySelect).toBeInTheDocument();
                expect(screen.getByText('Category 1')).toBeInTheDocument();
                expect(screen.getByText('Category 2')).toBeInTheDocument();
            });
        });

        // equivalence partitioning: ensures that category state changes
        it('updates state when category is changed', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const categorySelect = screen.getByRole('combobox', { name: /select a category/i });
                fireEvent.change(categorySelect, { target: { value: 'cat2' } });
                expect(categorySelect.value).toBe('cat2');
            });
        });
    });

    describe('Product Update Functionality', () => {
        // happy path for updating
        it('ensure input fields states are changed on update', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                // name
                const nameInput = screen.getByDisplayValue('Test Product 1')
                fireEvent.change(nameInput, { target: { value: 'Updated Product 1' } })
                expect(nameInput.value).toBe('Updated Product 1')

                // description
                const descriptionInput = screen.getByDisplayValue('Test Description 1')
                fireEvent.change(descriptionInput, { target: { value: 'Updated Description 1' } })
                expect(descriptionInput.value).toBe('Updated Description 1')

                // price
                const priceInput = screen.getByDisplayValue('100')
                fireEvent.change(priceInput, { target: { value: '200' } })
                expect(priceInput.value).toBe('200')

                // quantity
                const quantityInput = screen.getByDisplayValue('10');
                fireEvent.change(quantityInput, { target: { value: '50' } });
                expect(quantityInput.value).toBe('50');

                // category
                const categorySelect = screen.getByRole('combobox', { name: /select a category/i });
                fireEvent.change(categorySelect, { target: { value: 'cat2' } });
                expect(categorySelect.value).toBe('cat2');

                // shipping
                const shippingSelect = screen.getAllByTestId('category-select')[1]
                fireEvent.change(shippingSelect, { target: { value: '0' } })
                expect(shippingSelect.value).toBe('0')
            });
        });

        it('ensure input fields states are changed on update', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                // name
                const nameInput = screen.getByDisplayValue(mockProductCategory1.name);
                fireEvent.change(nameInput, { target: { value: 'Updated Product 1' } });
                expect(nameInput.value).toBe('Updated Product 1');

                // description
                const descriptionInput = screen.getByDisplayValue(mockProductCategory1.description);
                fireEvent.change(descriptionInput, { target: { value: 'Updated Description 1' } });
                expect(descriptionInput.value).toBe('Updated Description 1');

                // price
                const priceInput = screen.getByDisplayValue(mockProductCategory1.price);
                fireEvent.change(priceInput, { target: { value: '200' } });
                expect(priceInput.value).toBe('200');

                // quantity
                const quantityInput = screen.getByDisplayValue(mockProductCategory1.quantity);
                fireEvent.change(quantityInput, { target: { value: '50' } });
                expect(quantityInput.value).toBe('50');

                // category
                const categorySelect = screen.getByRole('combobox', { name: /select a category/i });
                fireEvent.change(categorySelect, { target: { value: 'cat2' } });
                expect(categorySelect.value).toBe('cat2');

                // shipping
                const shippingSelect = screen.getAllByTestId('category-select')[1];
                fireEvent.change(shippingSelect, { target: { value: '0' } });
                expect(shippingSelect.value).toBe('0');
            });
        });

        // equivalence partitioning: updates preview image correctly
        it('updates preview image when new image is uploaded', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const fileInput = screen
                    .getByText(/Upload Photo|photo\.name/i)
                    .closest('label')
                    .querySelector('input[type="file"]');
                const file = new File([mockProductCategory1.imageAlt], mockProductCategory1.imageName, { type: mockProductCategory1.imageType });
                fireEvent.change(fileInput, { target: { files: [file] } });
                const previewImage = screen.getByAltText('product_photo');
                expect(previewImage).toBeInTheDocument();
                expect(previewImage.src).toBe('http://localhost/mock-url');
            });
        });

        it('toast appears when product updates successfully', async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: UPDATE_SUCCESS_MESSAGE },
            });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                fireEvent.change(screen.getByDisplayValue(mockProductCategory1.price), { target: { value: "15" } });
                fireEvent.click(screen.getByText(updateProductButtonText));
            });
            // there is only an api call when the value is changed
            expect(axios.put).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith(UPDATE_SUCCESS_MESSAGE);
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
        });

        // equivalence partitioning: failed product update
        // it('toast appears when error occurs on failed product update', async () => {
        //     axios.put.mockResolvedValueOnce({
        //         data: { success: false, message: UPDATE_ERROR_MESSAGE },
        //     })

        //     render(
        //         <MemoryRouter>
        //             <Routes>
        //                 <Route path='/' element={<UpdateProduct />} />
        //             </Routes>
        //         </MemoryRouter>
        //     )

        //     await waitFor(() => {
        //         const nameInput = screen.getByDisplayValue(mockProductCategory1.name);
        //         fireEvent.change(nameInput, { target: { value: '' } });
        //         fireEvent.click(screen.getByText(updateProductButtonText));
        //     });
        //     expect(axios.put).toHaveBeenCalled();
        //     expect(toast.error).toHaveBeenCalledWith(UPDATE_ERROR_MESSAGE);
        // });

        // equivalence partitioning: unknown error during product update
        it('toast appears when unknown error occurs on update', async () => {
            axios.put.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: { success: false, message: BACKEND_ERROR_MESSAGE },
                },
            });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                fireEvent.click(screen.getByText(updateProductButtonText));
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE);
            });
        });

        // equivalence partitioning: successful product delete
        it('toast appears when product deleted successfully', async () => {
            const UPDATE_SUCCESS_MESSAGE = 'Product Deleted Successfully'
            axios.delete.mockResolvedValueOnce({
                data: { success: true, message: UPDATE_SUCCESS_MESSAGE },
            })
            window.prompt = jest.fn(() => 'yes')

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                fireEvent.click(screen.getByText('DELETE PRODUCT'))
            });
            expect(axios.delete).toHaveBeenCalled()
            expect(toast.success).toHaveBeenCalledWith(UPDATE_SUCCESS_MESSAGE)
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products')
        });

        // equivalence partitioning: product delete cancelled: "no"
        it('delete API not called when product not deleted (no)', async () => {
            window.prompt = jest.fn(() => 'no')

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                fireEvent.click(screen.getByText('DELETE PRODUCT'))
            });
            expect(axios.delete).not.toHaveBeenCalled()
        });

        // equivalence partitioning: product delete cancelled "null"
        it('delete API not called when unconfirmed delete occurs (nothing is entered)', async () => {
            window.prompt = jest.fn(() => null)

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                fireEvent.click(screen.getByText('DELETE PRODUCT'))
            });
            expect(axios.delete).not.toHaveBeenCalled()
        });

        // equivalence partitioning: unknown error during product delete
        // ideally, would want to have this test case, but
        // not sure how to simulate the event that an error occurs
        // thus unable to write the test case
        // it('toast appears when unknown error occurs on delete', async () => {
        //     window.prompt = jest.fn(() => null);

        //     render(
        //         <MemoryRouter>
        //             <Routes>
        //                 <Route path='/' element={<UpdateProduct />} />
        //             </Routes>
        //         </MemoryRouter>
        //     );

        //     await waitFor(() => {
        //         fireEvent.click(screen.getByText('DELETE PRODUCT'));
        //     });

        //     await waitFor(() => {
        //         expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE);
        //     });
        // });
    });

    describe('Edge Cases and Validation', () => {
        // bva: updating lowest possible valid values
        it('allows updating the lowest valid values', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                fireEvent.change(screen.getByDisplayValue(mockProductCategory1.price), { target: { value: '0.01' } });
                fireEvent.change(screen.getByDisplayValue(mockProductCategory1.quantity), { target: { value: '1' } });
            });
            fireEvent.click(screen.getByText(updateProductButtonText));
            expect(axios.put).toHaveBeenCalled();
        });

        // bva: updating highest possible valid values
        it('allows updating the highest valid values', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<UpdateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                fireEvent.change(screen.getByDisplayValue(mockProductCategory1.price), { target: { value: '9999999' } });
                fireEvent.change(screen.getByDisplayValue(mockProductCategory1.quantity), { target: { value: '1000000' } });
            });
            fireEvent.click(screen.getByText(updateProductButtonText));
            expect(axios.put).toHaveBeenCalled();
        });
    });
});

// ideally, the follow test cases should be added as well to check for long values and invalid values (bva)
describe('UpdateProduct Component - Additional Test Cases', () => {
    const updateProductButtonText = 'UPDATE PRODUCT';

    const mockProductCategory2 = {
        _id: '2222222222222222222222222222222222222222222222',
        name: 'Test Product 2222222222222222222222222222222222222222222222',
        description: 'Test Description 2222222222222222222222222222222222222222222222',
        price: 9999999999999999999999999999999,
        quantity: 999999999999999999999999999999,
        category: { _id: 'cat2', name: 'Category 2' },
        shipping: false,
    }

    const mockInvalidProduct1 = {
        _id: '0',
        name: 'Test Product 0',
        description: 'Test Description 0',
        price: 0,
        quantity: 0,
        category: { _id: 'cat0', name: 'Category 0' },
        shipping: false,
    }

    const mockInvalidProduct2 = {
        _id: '-1',
        name: '',
        description: '',
        price: -1,
        quantity: -1,
        category: { _id: '', name: '' },
        shipping: true,
    }

    const mockCategories = [
        { _id: 'cat1', name: 'Category 1' },
        { _id: 'cat2', name: 'Category 2' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    });

    // bva: large values
    it('renders correctly with mockProductCategory2 (large values)', async () => {
        axios.get.mockResolvedValueOnce({ data: { product: mockProductCategory2 } })
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue(mockProductCategory2.name)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockProductCategory2.description)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockProductCategory2.price.toString())).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockProductCategory2.quantity.toString())).toBeInTheDocument();
        });
    });

    // bva: 0 values
    it.failing('should not render correctly with mockInvalidProduct1 (zero values)', async () => {
        axios.get.mockResolvedValueOnce({ data: { product: mockInvalidProduct1 } })
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue(mockInvalidProduct1.name)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockInvalidProduct1.description)).toBeInTheDocument();
            expect(screen.getAllByDisplayValue(0)).toBeInTheDocument();
        });
    });

    // bva: invalid values
    it.failing('should not render correctly with mockInvalidProduct2 (negative values & empty fields)', async () => {
        axios.get.mockResolvedValueOnce({ data: { product: mockInvalidProduct2 } })
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByDisplayValue('')).toBeInTheDocument();
            expect(screen.getAllByDisplayValue('-1')).toBeInTheDocument();
        });
    });

    // invalid values -> fail
    // this returns an error in the console.log, should be handled
    it('does not allow update when all values are invalid', async () => {
        axios.get.mockResolvedValueOnce({ data: { product: mockProductCategory2 } });
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            fireEvent.change(screen.getByDisplayValue(mockProductCategory2.price), { target: { value: mockInvalidProduct2.price } });
            fireEvent.change(screen.getByDisplayValue(mockProductCategory2.quantity), { target: { value: mockInvalidProduct2.quantity } });
            fireEvent.click(screen.getByText(updateProductButtonText));
        });

        expect(toast.error).toHaveBeenCalledWith('something went wrong');
    });
});
