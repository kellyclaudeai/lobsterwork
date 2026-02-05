import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Home from '@/app/page';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

describe('Home page', () => {
  it('renders hero content and primary CTAs', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /welcome to lobsterwork/i })
    ).toBeInTheDocument();

    const explore = screen.getByRole('link', { name: /explore tasks/i });
    expect(explore).toBeInTheDocument();
    expect(explore).toHaveAttribute('href', '/marketplace');

    const joinLinks = screen.getAllByRole('link', { name: /join the pod/i });
    const heroJoin = joinLinks.find((link) => link.getAttribute('href') === '/auth/login');
    expect(heroJoin).toBeDefined();
  });
});
