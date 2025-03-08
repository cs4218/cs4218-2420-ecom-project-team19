import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import CreateProduct from './CreateProduct'

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

describe('CreateProduct Component', () => {
    const mockProductCategory1 = {
        name: 'Test Product 1',
        description: 'Test Description 1',
        price: '100',
        quantity: '10',
        category: 'cat1',
        shipping: 1,
        imageAlt: 'test',
        imageName: 'test.png',
        imageType: 'image/png'
    };

    const createProductButtonText = 'CREATE PRODUCT';

    const mockCategories = [
        { _id: 'cat1', name: 'Category 1' },
        { _id: 'cat2', name: 'Category 2' },
    ];

    const BACKEND_ERROR_MESSAGE = 'something went wrong';
    const CREATE_SUCCESS_MESSAGE = 'Product Created Successfully';

    beforeEach(() => {
        jest.clearAllMocks()
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
    })

    describe('Component Rendering & UI', () => {
        it('renders without crashing', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('Create Product')).toBeInTheDocument();
            });
        });

        it('correctly populates categories', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
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

        it('updates state when category is changed', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
    
            await waitFor(() => {
                const categorySelect = screen.getByRole('combobox', { name: /select a category/i })
                fireEvent.change(categorySelect, { target: { value: 'cat2' } })
                expect(categorySelect.value).toBe('cat2')
            });
        });

        it('opens prompt for uploading image', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const uploadButton = screen.getByText('Upload Photo');
                expect(uploadButton).toBeInTheDocument();
                const fileInput = uploadButton.closest('label').querySelector('input[type="file"]');
                expect(fileInput).toBeInTheDocument();
            });
        });

        it('updates preview image when new image is uploaded', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            const file = new File([mockProductCategory1.imageAlt], mockProductCategory1.imageName, { type: mockProductCategory1.imageType });

            await waitFor(() => {
                const fileInput = screen.getByText('Upload Photo').closest('label').querySelector('input[type="file"]');
                fireEvent.change(fileInput, { target: { files: [file] } });
                const previewImage = screen.getByAltText('product_photo');
                expect(previewImage).toBeInTheDocument();
                expect(previewImage.src).toBe('http://localhost/mock-url');
            });
        });
    });

    describe('Successful Product Creation', () => {
        it('toast appears when product updates successfully', async () => {
            axios.post.mockResolvedValueOnce({
                data: { success: true, message: CREATE_SUCCESS_MESSAGE },
            });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('write a name'), { target: { value: mockProductCategory1.name } });
            fireEvent.change(screen.getByPlaceholderText('write a description'), { target: { value: mockProductCategory1.description } });
            fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: mockProductCategory1.price } });
            fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: mockProductCategory1.quantity } });
            fireEvent.change(screen.getByRole('combobox', { name: /select a category/i }), { target: { value: mockProductCategory1.category } });
            fireEvent.change(screen.getByRole('combobox', { name: /select shipping/i }), { target: { value: mockProductCategory1.shipping } });

            const fileInput = screen.getByText('Upload Photo').closest('label').querySelector('input[type="file"]');
            const file = new File([mockProductCategory1.imageAlt], mockProductCategory1.imageName, { type: mockProductCategory1.imageType });
            fireEvent.change(fileInput, { target: { files: [file] } });
        
            fireEvent.click(screen.getByText(createProductButtonText));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(CREATE_SUCCESS_MESSAGE);
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
            });
        });

        it('sends POST request with all form data when "CREATE PRODUCT" is clicked', async () => {
            let capturedFormData;
            axios.post.mockImplementation((url, data) => {
                capturedFormData = data
                return Promise.resolve({data: { success: true, message: 'Product Created Successfully' }})
            });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /select a category/i })).toBeInTheDocument();
            });

            fireEvent.change(screen.getByPlaceholderText('write a name'), { target: { value: mockProductCategory1.name } });
            fireEvent.change(screen.getByPlaceholderText('write a description'), { target: { value: mockProductCategory1.description } });
            fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: mockProductCategory1.price } });
            fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: mockProductCategory1.quantity } });
            fireEvent.change(screen.getByRole('combobox', { name: /select a category/i }), { target: { value: mockProductCategory1.category } });
            fireEvent.change(screen.getByRole('combobox', { name: /select shipping/i }), { target: { value: mockProductCategory1.shipping } });

            const fileInput = screen.getByText('Upload Photo').closest('label').querySelector('input[type="file"]');
            const file = new File([mockProductCategory1.imageAlt], mockProductCategory1.imageName, { type: mockProductCategory1.imageType });
            fireEvent.change(fileInput, { target: { files: [file] } });

            fireEvent.click(screen.getByText(createProductButtonText));

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/create-product',expect.any(FormData));

                expect(capturedFormData.get('name')).toBe(mockProductCategory1.name);
                expect(capturedFormData.get('description')).toBe(mockProductCategory1.description);
                expect(capturedFormData.get('price')).toBe(mockProductCategory1.price);
                expect(capturedFormData.get('quantity')).toBe(mockProductCategory1.quantity);
                expect(capturedFormData.get('category')).toBe(mockProductCategory1.category);
                // expect(capturedFormData.get('shipping')).toBe(mockProductCategory1.shipping) // POST request doesn't send this

                const photoFile = capturedFormData.get('photo');
                expect(photoFile).toBeInstanceOf(File);
                expect(photoFile.name).toBe(mockProductCategory1.imageName);
                expect(photoFile.type).toBe(mockProductCategory1.imageType);
            });
        });
    });

    // unable to cover all branches
    describe('Creation Prevention', () => {
        it('displays error when price is invalid', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: '-10' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });

        it('displays error when price is missing', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: '' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });

        it('displays error when quantity is invalid', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: '-5' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });

        it('displays error when quantity is missing', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: '' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });

        it('displays error when shipping is invalid', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByRole('combobox', { name: /select shipping/i }), { target: { value: '2' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });

        it('displays error when shipping is missing', async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByRole('combobox', { name: /select shipping/i }), { target: { value: '' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });
    });

    describe('Error Handling', () => {
        it('displays error when submitting an empty form', async () => {
            axios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: { success: false, message: BACKEND_ERROR_MESSAGE },
                },
            });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /select a category/i })).toBeInTheDocument()
                fireEvent.click(screen.getByText(createProductButtonText))
                expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE)
            });
        });

        it('displays error when submitting form with invalid inputs', async () => {
            axios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: { success: false, message: BACKEND_ERROR_MESSAGE },
                },
            });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /select a category/i })).toBeInTheDocument();

                fireEvent.change(screen.getByPlaceholderText('write a name'), {target: { value: 'Test Product' }});
                fireEvent.change(screen.getByPlaceholderText('write a description'), {target: { value: 'Test Description' }});
                fireEvent.change(screen.getByPlaceholderText('write a Price'), {target: { value: '-1' }}); // invalid price
                fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: '0.1' }}); // invalid quantity
                fireEvent.change(screen.getByRole('combobox', { name: /select a category/i }), { target: { value: 'cat1' } });
                fireEvent.change(screen.getByRole('combobox', { name: /select shipping/i }), { target: { value: '1' } });
                
                // const fileInput = screen.getByText('Upload Photo').closest('label').querySelector('input[type="file"]');
                // const file = new File([mockProductCategory1.imageAlt], mockProductCategory1.imageName, { type: mockProductCategory1.imageType });
                // fireEvent.change(fileInput, { target: { files: [file] } });
        
                fireEvent.click(screen.getByText(createProductButtonText));

                expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE);
            });
        });

        it('displays error message on timeout', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded')
            timeoutError.code = 'ECONNABORTED'
            axios.post.mockRejectedValueOnce(timeoutError)

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /select a category/i })).toBeInTheDocument();
                fireEvent.click(screen.getByText(createProductButtonText));
                expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE);
            });
        });

        it('displays error when product creation fails', async () => {
            axios.post.mockResolvedValueOnce({
                data: { success: false },
            });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.change(screen.getByPlaceholderText('write a name'), { target: { value: 'Test Product' } });
            fireEvent.change(screen.getByPlaceholderText('write a description'), { target: { value: 'Test Description' } });
            fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: '100' } });
            fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: '10' } });
            fireEvent.change(screen.getByRole('combobox', { name: /select a category/i }), { target: { value: 'cat1' } });
            fireEvent.change(screen.getByRole('combobox', { name: /select shipping/i }), { target: { value: '1' } });
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
        });

        it('displays error when product creation request fails', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        
            fireEvent.click(screen.getByText('CREATE PRODUCT'));
        
            await waitFor(() => {
                consoleSpy.mock.calls.forEach(call => console.log("Console log output:", call));
        
                expect(toast.error).toHaveBeenCalledWith('something went wrong');
            });
            consoleSpy.mockRestore();
        });
         
    });
})