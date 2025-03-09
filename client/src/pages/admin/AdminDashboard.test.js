import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import { useAuth } from "../../context/auth";
import AdminDashboard from "./AdminDashboard";

jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div>
      <title>{title}</title>
      <main>{children}</main>
    </div>
));

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));

  describe("AdminDashboard Component", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // happy path
    describe("Rendering and Happy Path", () => {
        it('shows admin details when all details are provided', () => {

            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe',
                    email: 'john.doe@test.com',
                    phone: '81234567',
                },
            }]);

            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(getByText('Admin Name : John Doe')).toBeInTheDocument();
            expect(getByText('Admin Email : john.doe@test.com')).toBeInTheDocument();
            expect(getByText('Admin Contact : 81234567')).toBeInTheDocument();
        });
    });

    describe("Handling Missing User Details", () => {
        // all missing, should mean that when any are missing then it will still load
        // however, adding individual cases for each missing components
        // provides better assurance that a regression does not occur
        // if any of the values are incorrect
        it('handles missing all user details gracefully', () => {
            useAuth.mockReturnValue([{}]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name :')).toBeInTheDocument();
            expect(getByText('Admin Email :')).toBeInTheDocument();
            expect(getByText('Admin Contact :')).toBeInTheDocument();
        });

        // missing one component
        it('handles missing name gracefully', () => {
            useAuth.mockReturnValue([{
                user: {
                    email: 'john.doe@test.com',
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name :')).toBeInTheDocument();
            expect(getByText('Admin Email : john.doe@test.com')).toBeInTheDocument();
            expect(getByText('Admin Contact : 81234567')).toBeInTheDocument();
        });

        it('handles missing email gracefully', () => {
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe',
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name : John Doe')).toBeInTheDocument();
            expect(getByText('Admin Email :')).toBeInTheDocument();
            expect(getByText('Admin Contact : 81234567')).toBeInTheDocument();
        });
    
        it('handles missing phone gracefully', () => {
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe',
                    email: 'john.doe@test.com',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name : John Doe')).toBeInTheDocument();
            expect(getByText('Admin Email : john.doe@test.com')).toBeInTheDocument();
            expect(getByText('Admin Contact :')).toBeInTheDocument();
        }); 
    }); 

    describe("useAuth failure", () => {
        // potential useAuth failure
        it('handles useAuth returning null i.e. useAuth failure', () => {
            useAuth.mockReturnValue([null]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name :')).toBeInTheDocument();
            expect(getByText('Admin Email :')).toBeInTheDocument();
            expect(getByText('Admin Contact :')).toBeInTheDocument();
        });
    });

    // using BVA, we can come up with new potential test cases
    // such as a very long name/email/phone
    // or a very short name (since short email and phone do not make sense)
    // or name/email/phone with symbols
    describe("Edge Cases and BVA", () => {
        // short name/email/phone
        it('handles shortest valid name gracefully', () => {
            useAuth.mockReturnValue([{
                user: {
                    name: 'A',
                    email: 'john.doe@test.com',
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name : A')).toBeInTheDocument();
        });
        
        // long name
        it('handles long name length gracefully', () => {
            const longName = 'A'.repeat(255);
            useAuth.mockReturnValue([{
                user: {
                    name: longName,
                    email: 'john.doe@test.com',
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText(`Admin Name : ${longName}`)).toBeInTheDocument();
        });

        // long email
        it('handles long email length gracefully', () => {
            const longEmail = 'A'.repeat(64) + '@' + 'B'.repeat(185) + '.com';
            
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe',
                    email: longEmail,
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText(`Admin Email : ${longEmail}`)).toBeInTheDocument();
        });

        // long phone
        it('handles extremely long phone numbers gracefully', () => {
            const longPhone = '8'.repeat(50);
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe',
                    email: 'john.doe@test.com',
                    phone: longPhone,
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText(`Admin Contact : ${longPhone}`)).toBeInTheDocument();
        });

        // special characters in name
        it('handles special characters in name gracefully', () => {
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe 😊',
                    email: 'john.doe@test.com',
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name : John Doe 😊')).toBeInTheDocument();
        });

        // symbols characters in name
        it('handles symbols in name gracefully', () => {
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe +',
                    email: 'john.doe@test.com',
                    phone: '81234567',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Name : John Doe +')).toBeInTheDocument();
        });

        // international phone numbers
        it('handles international phone numbers correctly', () => {
            useAuth.mockReturnValue([{
                user: {
                    name: 'John Doe',
                    email: 'john.doe@test.com',
                    phone: '+44 20 7946 0958',
                },
            }]);
        
            const { getByText } = render(
                <MemoryRouter initialEntries={['/dashboard/admin']}>
                    <Routes>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            );
        
            expect(getByText('Admin Contact : +44 20 7946 0958')).toBeInTheDocument();
        });
    });
});