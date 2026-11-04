import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/ui/ErrorBoundary';

function Broken(): never {
  throw new Error('useHashRoute is not defined');
}

describe('ErrorBoundary', () => {
  it('shows a message and a reload button instead of a blank page', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Zerbait gaizki joan da');
    expect(screen.getByText('useHashRoute is not defined')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Freskatu orria' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders its children when nothing fails', () => {
    render(
      <ErrorBoundary>
        <p>ondo</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('ondo')).toBeInTheDocument();
  });
});
