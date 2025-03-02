import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import CreateCategory from './CreateCategory';

jest.mock('axios');
jest.mock('react-hot-toast');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div>
        <title>{title}</title>
        <main>{children}</main>
    </div>
));

jest.mock('../../components/AdminMenu', () => () => (
    <div>
        Admin Menu
        <button onClick={() => mockNavigate('/dashboard/admin/create-category')}>
            Create Category
        </button>
    </div>
));

jest.mock('../../components/Form/CategoryForm', () => ({ handleSubmit, value, setValue }) => (
    <form onSubmit={handleSubmit}>
        <input
            type='text'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Enter new category'
            data-testid='category-input'
        />
        <button type='submit' data-testid='submit-button'>Submit</button>
    </form>
));

jest.mock('antd', () => ({
    Modal: ({ children, visible, onCancel }) =>
        visible && (
            <div data-testid='edit-modal'>
                {children}
                <button onClick={onCancel}>Close</button>
            </div>
        ),
}));

describe('CreateCategory Component', () => {
    const mockCategories = [
        { _id: 'cat1', name: 'Category 1' },
        { _id: 'cat2', name: 'Category 2' },
    ];
    
    const GET_CATEGORY_ERROR_MESSAGE = 'Something went wrong in getting category';
    const INPUT_FORM_ERROR_MESSAGE = 'something went wrong in input form';
    const BACKEND_ERROR_MESSAGE = 'something went wrong';
    
    const CREATE_SUCCESS_MESSAGE = 'New Category is created';
    const UPDATE_SUCCESS_MESSAGE = 'Updated Category is updated';
    const DELETE_SUCCESS_MESSAGE = 'category is deleted';

    beforeEach(async () => {
        jest.clearAllMocks();
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } });

        await act(async () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<CreateCategory />} />
                    </Routes>
                </MemoryRouter>
            );
        });
    });

    describe('Component Rendering & UI', () => {
        it('renders create category form and table', async () => {
            await waitFor(() => {
                expect(screen.getByText('Manage Category')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('Enter new category')).toBeInTheDocument();
            });
        });

        it('navigates to create category page when "Create Category" button is clicked', async () => {
            fireEvent.click(screen.getByText('Create Category'));
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/create-category');
        });

        it('ensures the Admin Menu is displayed', () => {
            expect(screen.getByText('Admin Menu')).toBeInTheDocument();
        });

        it('ensures table headers are present', () => {
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });
    });

    describe('Create Category', () => {
        it('displays success message and refetches categories on successful category creation', async () => {
            axios.post.mockResolvedValueOnce({
                data: { success: true, message: CREATE_SUCCESS_MESSAGE, category: mockCategories[0] },
            });

            const input = await screen.findByPlaceholderText('Enter new category');
            fireEvent.change(input, { target: { value: 'New Category' } });
            fireEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', {
                    name: 'New Category',
                });
                expect(toast.success).toHaveBeenCalledWith(CREATE_SUCCESS_MESSAGE);
                expect(screen.getByText('Category 1')).toBeInTheDocument();
            });
        });
    });

    describe('Update Category', () => {
        it('opens update modal when edit button is clicked', async () => {
            await act(async () => {
                fireEvent.click(screen.getAllByText('Edit')[0]);
            });

            const editModal = await screen.findByTestId('edit-modal');
            expect(editModal).toBeInTheDocument();

            const input = screen.getAllByTestId('category-input')[1];
            expect(input).toHaveValue('Category 1');
        });

        it('displays success message and refetches categories on successful category edit', async () => {
            axios.put.mockResolvedValueOnce({ data: { success: true } });

            await act(async () => {
                fireEvent.click(screen.getAllByText('Edit')[0]);
            });

            const editModal = screen.getByTestId('edit-modal');
            const input = screen.getAllByTestId('category-input')[1];

            fireEvent.change(input, { target: { value: 'Updated Category' } });
            const submitButton = within(editModal).getByTestId('submit-button');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(axios.put).toHaveBeenCalledWith('/api/v1/category/update-category/cat1', {
                    name: 'Updated Category',
                });
                expect(toast.success).toHaveBeenCalledWith(UPDATE_SUCCESS_MESSAGE);
            });
        });
    });

    describe('Delete Category', () => {
        it('successfully deletes a category and refetches list', async () => {
            axios.delete.mockResolvedValueOnce({ data: { success: true } });

            await act(async () => {
                fireEvent.click(screen.getAllByText('Delete')[0]);
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(DELETE_SUCCESS_MESSAGE);
            });
        });

        it('displays error message when deleting category fails', async () => {
            axios.delete.mockRejectedValueOnce({ response: { status: 400, data: { success: false } } });

            await act(async () => {
                fireEvent.click(screen.getAllByText('Delete')[0]);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE);
            });
        });
    });

    describe('Error Handling', () => {
        it('displays error when creating category fails', async () => {
            axios.post.mockRejectedValueOnce({
                response: { status: 400, data: { success: false } },
            });

            fireEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(INPUT_FORM_ERROR_MESSAGE);
            });
        });

        it('displays error when updating category fails', async () => {
            axios.put.mockRejectedValueOnce({
                response: { status: 400, data: { success: false } },
            });

            await act(async () => {
                fireEvent.click(screen.getAllByText('Edit')[0]);
            });

            const editModal = screen.getByTestId('edit-modal');
            const input = screen.getAllByTestId('category-input')[1];

            fireEvent.change(input, { target: { value: 'Updated Category' } });
            const submitButton = within(editModal).getByTestId('submit-button');
            fireEvent.click(submitButton);            

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE);
            });
        });

        it('displays error message on timeout', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded');
            timeoutError.code = 'ECONNABORTED';
            axios.post.mockRejectedValueOnce(timeoutError);

            fireEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(INPUT_FORM_ERROR_MESSAGE);
            });
        });

        it('displays error message when category creation fails due to backend rejection', async () => {
            axios.post.mockResolvedValueOnce({
                data: { success: false, message: 'Category creation failed' },
            });
        
            fireEvent.change(screen.getByPlaceholderText('Enter new category'), { target: { value: 'Invalid Category' } });
            fireEvent.click(screen.getByText('Submit'));
        
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', { name: 'Invalid Category' });
                expect(toast.error).toHaveBeenCalledWith('Category creation failed');
            });
        });

        it('logs error and displays toast when category fetch fails', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            axios.get.mockRejectedValueOnce(new Error('Fetch Error'));
        
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Routes>
                            <Route path='/' element={<CreateCategory />} />
                        </Routes>
                    </MemoryRouter>
                );
            });
        
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(new Error('Fetch Error'));
                expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting category');
            });
        
            consoleSpy.mockRestore();
        });

        it('displays error message when category update fails', async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: false, message: 'Category update failed' },
            });
        
            await act(async () => {
                fireEvent.click(screen.getAllByText('Edit')[0]);
            });
        
            fireEvent.change(screen.getAllByTestId('category-input')[1], { target: { value: 'New Name' } });
            fireEvent.click(screen.getAllByTestId('submit-button')[1]);
        
            await waitFor(() => {
                expect(axios.put).toHaveBeenCalledWith('/api/v1/category/update-category/cat1', { name: 'New Name' });
                expect(toast.error).toHaveBeenCalledWith('Category update failed');
            });
        });

        it('displays error message when category deletion fails', async () => {
            axios.delete.mockResolvedValueOnce({
                data: { success: false, message: 'Category deletion failed' },
            });
        
            await act(async () => {
                fireEvent.click(screen.getAllByText('Delete')[0]);
            });
        
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Category deletion failed');
            });
        });

        it('closes modal when cancel button is clicked', async () => {
            await act(async () => {
                fireEvent.click(screen.getAllByText('Edit')[0]);
            });
        
            const modal = screen.getByTestId('edit-modal');
            expect(modal).toBeInTheDocument();
        
            fireEvent.click(within(modal).getByText('Close'));
        
            await waitFor(() => {
                expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
            });
        });

        it('opens modal when edit button is clicked', async () => {
            await act(async () => {
                fireEvent.click(screen.getAllByText('Edit')[0]);
            });
        
            expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
        });
    });
});
