import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../src/ui/App';

describe('App', () => {
  it('renders the five main menu sections in Basque', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Menu nagusia' });
    const labels = Array.from(nav.querySelectorAll('button')).map((b) => b.textContent);
    expect(labels).toEqual([
      'Editorea',
      'Txantiloiak',
      'Ariketak',
      'Sortzailea',
      'Teoria',
      'Nire aurrerapena',
    ]);
  });

  it('switches section when a menu item is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Teoria' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Teoria');
    expect(screen.getByRole('button', { name: 'Teoria' })).toHaveAttribute('aria-current', 'page');
  });
});
