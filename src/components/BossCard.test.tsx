import React from 'react';
import { render, screen } from '@testing-library/react';
import { BossCard } from './BossCard';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: React.ComponentProps<'img'>) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockBoss = {
  name: 'Test Boss',
  high: 5000,
  date: '2024-01-01',
  image: '/images/test-boss.png',
  tier: 'LEGENDARY'
};

describe('BossCard', () => {
  it('renders boss information correctly', () => {
    render(
      <BossCard
        boss={mockBoss}
        index={0}
        isCurrentBoss={true}
        isComplete={false}
        isFutureBoss={false}
        progress={0.5}
        hp={50}
      />
    );

    expect(screen.getByText('Test Boss')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows grey overlay with HP, tier, level, and spawn date', () => {
    render(
      <BossCard
        boss={mockBoss}
        index={0}
        isCurrentBoss={true}
        isComplete={false}
        isFutureBoss={false}
        progress={0.5}
        hp={50}
      />
    );

    // Check for overlay elements
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('TIER')).toBeInTheDocument();
    expect(screen.getByText('LEVEL')).toBeInTheDocument();
    expect(screen.getByText('SPAWN')).toBeInTheDocument();
    
    // Check for values
    expect(screen.getByText('50/100')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies correct styles for current boss', () => {
    const { container } = render(
      <BossCard
        boss={mockBoss}
        index={0}
        isCurrentBoss={true}
        isComplete={false}
        isFutureBoss={false}
        progress={0.5}
        hp={50}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-cyan-400');
    expect(card).toHaveClass('scale-110');
  });

  it('applies correct styles for defeated boss', () => {
    const { container } = render(
      <BossCard
        boss={mockBoss}
        index={0}
        isCurrentBoss={false}
        isComplete={true}
        isFutureBoss={false}
        progress={1}
        hp={0}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-green-400');
    expect(card).toHaveClass('opacity-75');
  });
});
